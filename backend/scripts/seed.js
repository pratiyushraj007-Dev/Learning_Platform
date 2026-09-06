require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const seedDemoData = require('./seedDemoData');

const seed = async () => {
  await connectDB();
  await seedDemoData();
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
