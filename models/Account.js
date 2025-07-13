const connectDB = require('./db');
const { ObjectId } = require('mongodb');

async function createAccount(accountData) {
  const db = await connectDB();
  const result = await db.collection('accounts').insertOne(accountData);
  return { ...accountData, _id: result.insertedId };
}

async function getAccountsByUser(userId) {
  const db = await connectDB();
  return db.collection('accounts').find({ user_id: userId }).toArray();
}

async function deleteAccount(accountId, userId) {
  const db = await connectDB();
  const result = await db.collection('accounts').deleteOne({
    _id: new ObjectId(accountId),
    user_id: userId
  });
  return result.deletedCount === 1;
}

async function updateAccount(accountId, userId, updateData) {
  const db = await connectDB();
  const result = await db.collection('accounts').updateOne(
    { _id: new ObjectId(accountId), user_id: userId },
    { $set: { ...updateData, updated_at: new Date() } }
  );
  return result.modifiedCount > 0;
}

module.exports = {
  createAccount,
  getAccountsByUser,
  deleteAccount,
  updateAccount
};
