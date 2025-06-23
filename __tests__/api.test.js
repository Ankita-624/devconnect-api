require('dotenv').config(); 

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Resource = require('../models/Resource');
const User = require('../models/User');

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Resource.deleteMany();
  await User.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('API Test Suite', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'Test User',
      email: 'testapi@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
  });

  it('should login and return a token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'testapi@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('should allow authenticated resource creation', async () => {
    const res = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'API Test Resource',
        link: 'https://testresource.com',
        category: 'Article',
        description: 'Test resource via API',
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('API Test Resource');
  });

  it('should fetch all resources', async () => {
    const res = await request(app).get('/api/resources');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.resources)).toBe(true);
  });
});
