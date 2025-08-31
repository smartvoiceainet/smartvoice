import mongoose from "mongoose";

/**
 * Global mongoose connection interface
 */
interface MongooseConnection {
  isConnected?: number;
  conn?: typeof mongoose;
  promise?: Promise<typeof mongoose>;
}

/**
 * Declare the mongoose global type to avoid TypeScript errors
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: MongooseConnection;
}

/**
 * Global variable to maintain connection status across API calls
 */
const globalConnection = global.mongooseConnection || {};

// Initialize connection object if not exists
if (!global.mongooseConnection) {
  global.mongooseConnection = globalConnection;
}

/**
 * Connect to MongoDB database
 * This function ensures a cached connection is used when possible
 */
async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  // If we have a connection already, return it
  if (globalConnection.isConnected === 1) {
    return globalConnection.conn;
  }

  // If a connection is being established, wait for it
  if (globalConnection.promise) {
    globalConnection.conn = await globalConnection.promise;
    globalConnection.isConnected = 1;
    return globalConnection.conn;
  }

  // Create new connection
  try {
    const opts = {
      bufferCommands: false,
    };

    // Store the connection promise
    globalConnection.promise = mongoose.connect(MONGODB_URI, opts);
    
    // Resolve the promise and store the connection
    globalConnection.conn = await globalConnection.promise;
    globalConnection.isConnected = 1;

    return globalConnection.conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export default dbConnect;
