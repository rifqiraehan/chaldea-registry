const request = require('supertest');
const http = require('http');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
require('dotenv').config({ quiet: true });

const server = require('../server');

const TEST_EMAIL = 'jest_user@example.com';
const TEST_PASSWORD = 'jest_password';
const TEST_USERNAME = 'jest_user';

let client;
let db;
let appInstance;

beforeAll(async () => {
  appInstance = server.listen(4000);
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db(process.env.DATABASE_NAME);
  await db.collection('users').deleteMany({ email: TEST_EMAIL });
});

afterAll(async () => {
  await db.collection('users').deleteMany({ email: TEST_EMAIL });
  await client.close();
  
  await new Promise((resolve) => appInstance.close(resolve));
});

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(appInstance)
      .post('/api/auth/register')
      .send({
        username: TEST_USERNAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered');
  });

  it('should fail to register existing user', async () => {
    const res = await request(appInstance)
      .post('/api/auth/register')
      .send({
        username: 'dummy',
        email: TEST_EMAIL,
        password: 'anything'
      });

    expect(res.statusCode).toBe(409);
  });

  it('should login with correct credentials', async () => {
    const res = await request(appInstance)
      .post('/api/auth/login')
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.email).toBe(TEST_EMAIL);
  });

  it('should reject login with wrong password', async () => {
    const res = await request(appInstance)
      .post('/api/auth/login')
      .send({
        email: TEST_EMAIL,
        password: 'wrong_password'
      });

    expect(res.statusCode).toBe(401);
  });
});
