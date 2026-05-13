import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';

// Import your Category and SubCategory models
// Note: Ensure the Category model path exactly matches your file name!
import Category from '../models/category.model.js'; 
import SubCategory from '../models/subCategory.model.js';

dotenv.config();

// 1. Cloudinary Configuration (Your NEW account)
cloudinary.config({
  cloud_name: process.env.NEW_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEW_CLOUDINARY_API_KEY,
  api_secret: process.env.NEW_CLOUDINARY_API_SECRET
});

// 2. Search Function for Categories (Returns exactly 1 single image)
async function findCategoryImage(name) {
  const data = JSON.stringify({
    // Adding "makeup cosmetics aesthetic" helps find nice, clean category images
    "q": `${name} makeup cosmetics aesthetic`, 
    "type": "images",
    "num": 1 // Strictly fetch only 1 image from the search API
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
      // Return the exact image URL
      return response.data.images[0].imageUrl;
    }
    return null;
  } catch (error) {
    console.error(`Search failed for ${name}:`, error.message);
    return null;
  }
}

// 3. Reusable function to process a specific collection
async function processCollection(Model, collectionName) {
  const items = await Model.find({});
  console.log(`\n--- Starting Recovery for ${collectionName} (${items.length} items) ---`);

  for (let item of items) {
    console.log(`Searching for: ${item.name}`);

    const foundImageUrl = await findCategoryImage(item.name);

    if (!foundImageUrl) {
      console.log(`❌ No image found online for: ${item.name}`);
      continue;
    }

    try {
      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(foundImageUrl, {
        folder: `recovered_${collectionName.toLowerCase()}`, // e.g., recovered_categories
      });

      // Update the database (Saving as a String, exactly 1 image)
      item.image = uploadResult.secure_url;
      await item.save();
      
      console.log(`✨ Successfully saved 1 image for: ${item.name}`);
    } catch (uploadError) {
      console.error(`⚠️ Cloudinary upload failed for ${item.name}:`, uploadError.message);
    }

    // Add a 1-second delay to respect API rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// 4. Main Execution Function
async function runCategoryRecovery() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');

    // Process Categories first
    await processCollection(Category, 'Categories');

    // Then Process SubCategories
    await processCollection(SubCategory, 'SubCategories');

    console.log('\n-----------------------------------');
    console.log('Category & SubCategory Recovery Finished!');

  } catch (error) {
    console.error('An error occurred during recovery:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

// Execute
runCategoryRecovery();