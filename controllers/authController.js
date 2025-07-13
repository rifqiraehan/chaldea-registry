const { findUserByEmail, createUser } = require('../models/User');
const sendJson = require('../utils/sendJson');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function register(req, res) {
  const { username, email, password } = req.body;
  const existing = await findUserByEmail(email);
  if (existing) return sendJson(res, 409, { message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser({
    username,
    email,
    password: hashedPassword,
    created_at: new Date(),
    updated_at: new Date()
  });

  delete user.password;

  sendJson(res, 201, { message: 'User registered', user });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);
  if (!user) return sendJson(res, 401, { message: 'Invalid credentials' });

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return sendJson(res, 401, { message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: '1d' });
  sendJson(res, 200, { token });
}

module.exports = { register, login };