import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const connUri =
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/collab_db';
    console.log(`Connecting to MongoDB: ${connUri}...`);

    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const err = error as Error;
    console.error(`MongoDB Connection Error: ${err.message}`);
    console.log(
      'Ensure MongoDB is running locally, or provide MONGODB_URI in backend/.env'
    );
  }
};

export default connectDB;
