jest.setTimeout(20000);

const request = require('supertest');
const { MongoClient, ObjectId } = require('mongodb');
const server = require('../server');
require('dotenv').config({ quiet: true });

const TEST_USER = {
  username: 'fgo_account_test',
  email: 'fgo_account_test@example.com',
  password: 'test123'
};

let client, db, appInstance, api;
let token = '';
let testAccountId = '';

beforeAll(async () => {
  appInstance = server.listen(0);
  api = request(appInstance);

  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db(process.env.DATABASE_NAME);

  await db.collection('accounts').deleteMany({});
  await db.collection('users').deleteOne({ email: TEST_USER.email });

  await api.post('/api/auth/register').send(TEST_USER);
  const loginRes = await api.post('/api/auth/login').send({
    email: TEST_USER.email,
    password: TEST_USER.password
  });
  token = loginRes.body.token;

  const createRes = await api
    .post('/api/account')
    .set('Authorization', `Bearer ${token}`)
    .send({
      server_id: 'JP',
      status: 'OFFLINE',
      transfer_code: 'init123456',
      game_code: '123456789',
      ssr_list: ['Saber']
    });

  if (!createRes.body.account) {
    console.error('Account creation failed:', createRes.body);
    throw new Error('Failed to create initial test account.');
  }

  testAccountId = createRes.body.account._id;
});

afterAll(async () => {
  try {
    await db.collection('accounts').deleteOne({ _id: new ObjectId(testAccountId) });
    await db.collection('users').deleteOne({ email: TEST_USER.email });
  } catch (err) {
    console.error('Cleanup error:', err);
  }

  if (client) await client.close();
  if (appInstance) await new Promise(resolve => appInstance.close(resolve));
});

describe('FGO Account API', () => {
  it('should update an account', async () => {
    const res = await api
      .put(`/api/account?id=${testAccountId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({
        status: 'ONLINE',
        ssr_list: ['Saber', 'Archer']
      });


    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Account updated');
  }, 30000);

  it('should get all user accounts', async () => {
    const res = await api
      .get('/api/account')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.accounts)).toBe(true);
  });

  it('should reject request without token', async () => {
    const res = await api.get('/api/account');
    expect(res.statusCode).toBe(401);
  });

  it('should delete an account', async () => {
    const createRes = await api
      .post('/api/account')
      .set('Authorization', `Bearer ${token}`)
      .send({
        server_id: 'NA',
        status: 'OFFLINE',
        transfer_code: 'deleteme01',
        game_code: '334455667',
        ssr_list: ['Caster']
      });

    if (!createRes.body.account) {
      console.error('Delete test account creation failed:', createRes.body);
      throw new Error('Failed to create account for deletion test');
    }

    const deleteId = createRes.body.account._id;

    const res = await api
      .delete(`/api/account?id=${deleteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Account deleted');
  }, 30000);

  it('should reject update with invalid transfer_code', async () => {
    const res = await api
      .put(`/api/account?id=${testAccountId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ transfer_code: 'short' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation error');
    expect(res.body.errors).toContain('transfer_code must be a 10-character alphanumeric string');
  });

  it('should reject create with invalid game_code', async () => {
    const res = await api
      .post('/api/account')
      .set('Authorization', `Bearer ${token}`)
      .send({
        server_id: 'JP',
        status: 'OFFLINE',
        transfer_code: 'abcdefghij',
        game_code: 'abc123',
        ssr_list: ['Lancer']
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain('game_code must be exactly 9 numeric digits');
  });

  it('should return 404 for update with invalid ID', async () => {
    const res = await api
      .put(`/api/account?id=6123456789abcdef01234567`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'ONLINE' });

    expect(res.statusCode).toBe(404);
  });
});
