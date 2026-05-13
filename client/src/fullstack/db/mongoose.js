import mongoose from "mongoose";

const globalForMongoose = globalThis;

/** @type {{ conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }} */
const cache = globalForMongoose._essentialistMongoose ?? {
  conn: null,
  promise: null,
};
globalForMongoose._essentialistMongoose = cache;

const mongoOptions = {
  autoIndex: process.env.NODE_ENV !== "production",
  serverSelectionTimeoutMS: 30_000,
  socketTimeoutMS: 45_000,
  family: 4,
};

/**
 * Connects once per server process (Next dev / Node runtime). Same DB URI as Express.
 */
export async function connectMongo() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, mongoOptions).then(() => mongoose);
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

export function getMongoReadyState() {
  return mongoose.connection.readyState;
}
