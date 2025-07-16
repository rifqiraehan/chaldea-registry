const {
  findUserByEmail,
  findUserByEmailOrUsername,
  createUser
} = require('../models/User');

const sendJson = require('../utils/sendJson');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function register(req, res) {
  console.log('[AUTH_CONTROLLER] Inside register function.');
  const { username, email, password } = req.body;
  console.log(`[AUTH_CONTROLLER] Registering user: ${email}`);
  const existing = await findUserByEmail(email);
  if (existing) {
    console.warn('[AUTH_CONTROLLER] User already exists:', email);
    return sendJson(res, 409, { message: 'User already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser({
    username,
    email,
    password: hashedPassword,
    created_at: new Date(),
    updated_at: new Date()
  });
  console.log('[AUTH_CONTROLLER] User created:', user.email);
  delete user.password;
  sendJson(res, 201, { message: 'User registered', user });
}

async function login(req, res) {
  console.log('[AUTH_CONTROLLER] Inside login function.');
  const { identifier, email, username, password } = req.body;

  const identity = identifier || email || username;
  console.log(`[AUTH_CONTROLLER] Attempting login for: ${identity}`);
  if (!identity || !password) {
    return sendJson(res, 400, { message: 'Missing credentials' });
  }

  const user = await findUserByEmailOrUsername(identity);
  if (!user) return sendJson(res, 401, { message: 'Invalid credentials' });

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return sendJson(res, 401, { message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
  sendJson(res, 200, { token });
}

module.exports = { register, login };
