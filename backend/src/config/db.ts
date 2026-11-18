import mongoose from 'mongoose';
import { ENV } from './env';

export const connectDB = async (): Promise<boolean> => {
  if (!ENV.MONGO_URI) {
    console.warn('⚠️  [MongoDB] MONGO_URI is not set in backend/.env. MongoDB features will be unavailable until configured.');
    return false;
  }

  try {
    const conn = await mongoose.connect(ENV.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ [MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return true;
  } catch (error: any) {
    console.error(`❌ [MongoDB] Connection error: ${error.message}`);
    console.warn('⚠️  [MongoDB] Server will continue running for health and unauthenticated testing. Ensure your MongoDB Atlas IP access list includes your current IP.');
    return false;
  }
};
