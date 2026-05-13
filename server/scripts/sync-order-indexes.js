import "dotenv/config.js";
import mongoose from "mongoose";
import OrderModel from "../models/order.model.js";

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is not set. Please define it before running this script.");
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected. Syncing indexes…");
    await OrderModel.syncIndexes();
    console.log("Order indexes synchronized.");
  } catch (error) {
    console.error("Failed to sync indexes:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
})();