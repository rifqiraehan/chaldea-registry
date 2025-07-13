const connectDB = require('./db');

async function findUserByEmail(email) {
  const db = await connectDB();
  return db.collection('users').findOne({ email });
}

async function createUser(userData) {
  const db = await connectDB();
  const result = await db.collection('users').insertOne(userData);
  const newUser = result.ops?.[0] || userData;
  delete newUser.password;
  return newUser;
}

module.exports = {
  findUserByEmail,
  createUser
};
