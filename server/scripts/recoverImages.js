import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';

// Ensure the path and .js extension match your ES Module setup exactly
import Product from '../models/product.model.js';

dotenv.config();

// 1. Cloudinary Configuration (Your NEW account)
cloudinary.config({
  cloud_name: process.env.NEW_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEW_CLOUDINARY_API_KEY,
  api_secret: process.env.NEW_CLOUDINARY_API_SECRET
});

// 2. Function to find multiple image URLs using Google Search (via Serper)
async function findProductImages(productName, imageCount = 3) {
  const data = JSON.stringify({
    // Adding "makeup" and "official" helps filter out random blog photos
    "q": `${productName} makeup official product`, 
    "type": "images",
    "num": 10 // Fetch 10 to be safe, then we pick the best ones
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
      // Extract just the URLs for the top 3 results
      return response.data.images.slice(0, imageCount).map(img => img.imageUrl);
    }
    return [];
  } catch (error) {
    console.error(`Search failed for ${productName}:`, error.message);
    return [];
  }
}

async function runRecovery() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');

    const products = await Product.find({});
    console.log(`Processing ${products.length} products...`);

    for (let product of products) {
      console.log(`-----------------------------------`);
      console.log(`Searching for: ${product.name}`);

      // 3. Search for 3 new image URLs
      const foundImageUrls = await findProductImages(product.name, 3);

      if (foundImageUrls.length === 0) {
        console.log(`❌ No images found online for: ${product.name}`);
        continue;
      }

      console.log(`✅ Found ${foundImageUrls.length} images online! Uploading to Cloudinary...`);
      let newCloudinaryUrls = [];

      // 4. Loop through the 3 URLs and upload each one
      for (let imgUrl of foundImageUrls) {
        try {
          const uploadResult = await cloudinary.uploader.upload(imgUrl, {
            folder: 'recovered_products', // Keeps your new account organized
          });
          newCloudinaryUrls.push(uploadResult.secure_url);
        } catch (uploadError) {
          console.error(`⚠️ Failed to upload one of the images:`, uploadError.message);
          // If one fails (e.g., dead link), it will just skip it and try the next one
        }
      }

      // 5. Update the product image array in MongoDB if we successfully uploaded any
      if (newCloudinaryUrls.length > 0) {
        product.image = newCloudinaryUrls;
        await product.save();
        console.log(`✨ Successfully saved ${newCloudinaryUrls.length} images to the database for: ${product.name}`);
      } else {
        console.log(`❌ All Cloudinary uploads failed for this product.`);
      }

      // Add a small delay (1 second) to prevent hitting rate limits on Cloudinary or Serper
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('-----------------------------------');
    console.log('Recovery Process Finished!');

  } catch (error) {
    console.error('An error occurred during recovery:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

// Execute the function
runRecovery();