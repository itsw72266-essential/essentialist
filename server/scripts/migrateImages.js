import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// 1. Point this to exactly where your Product model is located
// NOTE: ES Modules require the .js extension for local files!
import Product from '../models/product.model.js';

// Load environment variables (this will automatically look in your server folder)
dotenv.config(); 

// 2. Configure your NEW Cloudinary account credentials
cloudinary.config({
  cloud_name: process.env.NEW_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEW_CLOUDINARY_API_KEY,
  api_secret: process.env.NEW_CLOUDINARY_API_SECRET
});

// console.log('--- CREDENTIAL CHECK ---');
// console.log('Cloud Name:', process.env.NEW_CLOUDINARY_CLOUD_NAME);
// console.log('API Key:', process.env.NEW_CLOUDINARY_API_KEY ? 'Loaded successfully' : 'MISSING');
// console.log('------------------------');

async function runMigration() {
  try {
    // 3. Connect to MongoDB Atlas using the URI from your .env file
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas successfully.');

    // 4. Fetch all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to process.`);

    for (let product of products) {
      if (!product.image || product.image.length === 0) continue;

      let newImageUrls = [];
      let hasChanges = false;

      // 5. Loop through the image array of each product
      for (let oldImageUrl of product.image) {
        console.log(`Migrating image for: ${product.name}`);
        
        try {
          // Upload the old URL directly to the new Cloudinary account
          const uploadResult = await cloudinary.uploader.upload(oldImageUrl, {
            folder: 'glamour_glow_products', // Organizes them in a folder on your new account
          });

          newImageUrls.push(uploadResult.secure_url);
          hasChanges = true;
        } catch (uploadError) {
          console.error(`Failed to upload image for ${product.name}:`, uploadError.message);
          // Keep the old URL if the upload fails so you don't lose the image entirely
          newImageUrls.push(oldImageUrl); 
        }
      }

      // 6. Update the database if new URLs were generated
      if (hasChanges) {
        product.image = newImageUrls;
        await product.save();
        console.log(`Successfully updated database for: ${product.name}`);
      }
    }

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('An error occurred during the migration:', error);
  } finally {
    // 7. Disconnect from the database so the terminal prompt returns
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

// Execute the function
runMigration();