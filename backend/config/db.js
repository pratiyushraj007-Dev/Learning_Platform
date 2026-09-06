const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const seedDemoData = require('../scripts/seedDemoData');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-platform';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    await seedDemoData();
  } catch (error) {
    console.warn(`Local MongoDB connection failed (${error.message}). Starting In-Memory MongoDB Server...`);
    try {
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`In-Memory MongoDB connected: ${conn.connection.host}`);
      await seedDemoData();
    } catch (memError) {
      console.error(`In-Memory MongoDB start error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
