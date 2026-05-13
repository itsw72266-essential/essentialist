// import mongoose from "mongoose";
// import dotenv from "dotenv"
// dotenv.config()

// if(!process.env.MONGODB_URI){
//     throw new Error(
//         "Please provide MONGODB_URI in the .env file"
//     )
// }

// async function connectDB() {
//     try {
//         await mongoose.connect(process.env.MONGODB_URI)
//         console.log("Connected to the database successfullly")
//     }catch (error) {
//         console.log("MongoDB connection error", error)
//         process.exit(1)
//     }
// }

// export default connectDB




import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("Please provide MONGODB_URI in the .env file");
}

async function connectDB() {
  try {
    // Set mongoose options for enhanced security
    const options = {
      autoIndex: process.env.NODE_ENV !== 'production', // Don't build indexes in production
      serverSelectionTimeoutMS: 30000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log("Connected to the database successfully");
    
    // Add event listeners for connection issues
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected, attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
  } catch (error) {
    console.error("MongoDB connection error", error);
    process.exit(1);
  }
}

// console.log("USING URI:", process.env.MONGODB_URI);


export default connectDB;