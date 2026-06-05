const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/collab_db';
    console.log(`Connecting to MongoDB: ${connUri}...`);
    
    // Set connection timeout to 5 seconds so it doesn't hang forever if MongoDB is not running
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Ensure MongoDB is running locally, or provide MONGODB_URI in backend/.env');
    // We will not exit the process, instead let it run so the developer can see the error,
    // or we can fall back to using an in-memory/file mock if mongoose calls fail.
    // In our routes, we will check mongoose.connection.readyState. If it's not connected,
    // we can either return an error or use a simple in-memory mock store.
  }
};

module.exports = connectDB;
