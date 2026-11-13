const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri || /YOUR_USER|YOUR_PASSWORD|YOUR_CLUSTER|replace[_ -]?with/i.test(uri)) throw new Error('MONGO_URI is missing or still contains example placeholders. Configure a real MongoDB connection string.');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

module.exports = connectDB;
