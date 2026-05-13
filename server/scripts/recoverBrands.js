import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';

import Brand from '../models/brand.model.js'; 

dotenv.config();

cloudinary.config({
  cloud_name: process.env.NEW_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEW_CLOUDINARY_API_KEY,
  api_secret: process.env.NEW_CLOUDINARY_API_SECRET
});

async function findBrandLogos(name) {
  const data = JSON.stringify({
    "q": `${name} makeup cosmetics brand logo png transparent`, 
    "type": "images",
    "num": 5 
  });

  const config = {
    method: 'post',
    url: 'https://google.serper.dev/images',
    headers: { 
      'X-API-KEY': process.env.SERPER_API_KEY, 
      'Content-Type': 'application/json'
    },
    data : data
  };

  try {
    const response = await axios(config);
    if (response.data.images && response.data.images.length > 0) {
      return response.data.images.map(img => img.imageUrl);
    }
    return [];
  } catch (error) {
    console.error(`Search failed for ${name}:`, error.message);
    return [];
  }
}

async function runBrandRecovery() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');

    const brands = await Brand.find({});
    console.log(`\n--- Starting Recovery for Brands (${brands.length} items) ---`);

    for (let brand of brands) {
      console.log(`\nSearching for logo: ${brand.name}`);

      const foundLogoUrls = await findBrandLogos(brand.name);

      if (foundLogoUrls.length === 0) {
        console.log(`❌ No logos found online for: ${brand.name}`);
        continue;
      }

      let uploadSuccess = false;

      for (let logoUrl of foundLogoUrls) {
        try {
          const uploadResult = await cloudinary.uploader.upload(logoUrl, {
            folder: 'recovered_brands', 
          });

          // THE FIX: Direct Database Update
          await Brand.updateOne(
            { _id: brand._id }, 
            { $set: { logo: uploadResult.secure_url } }
          );
          
          console.log(`✨ Successfully saved logo for: ${brand.name}`);
          uploadSuccess = true;
          break; 

        } catch (uploadError) {
          console.log(`   ⚠️ Failed, trying next... (${uploadError.message})`);
        }
      }

      if (!uploadSuccess) {
        console.log(`❌ All 5 logo options failed to upload for: ${brand.name}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n-----------------------------------');
    console.log('Brand Logo Recovery Finished!');

  } catch (error) {
    console.error('An error occurred during recovery:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

runBrandRecovery();