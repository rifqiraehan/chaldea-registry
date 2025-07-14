const { MongoClient } = require('mongodb');
require('dotenv').config({ quiet: true });

const client = new MongoClient(process.env.MONGODB_URI);
const dbName = process.env.DATABASE_NAME || 'fgo';
let isConnected = false;

async function connectDB() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  return client.db(dbName);
}

module.exports = connectDB;
