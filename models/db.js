const { MongoClient } = require('mongodb');
require('dotenv').config({ quiet: true });

const client = new MongoClient(process.env.MONGODB_URI);
const dbName = process.env.DATABASE_NAME || 'fgo';

async function connectDB() {
  if (!client.isConnected) {
    await client.connect();
  }
  return client.db(dbName);
}

module.exports = connectDB;
