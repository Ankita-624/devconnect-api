const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Resource = require('../models/Resource');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let mongoServer;
let token;
let resourceId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const password = await bcrypt.hash('testpass', 10);
  const user = await User.create({
    username: 'TestUser',
    email: 'test@example.com',
    password
  });

  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'testsecret');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Integration - Resource CRUD', () => {
  it('POST /api/resources - should create resource', async () => {
    const res = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Resource',
        link: 'https://example.com',
        category: 'Article',
        description: 'Test desc',
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Resource');
    resourceId = res.body._id;
  });

  it('GET /api/resources - should get all resources', async () => {
    const res = await request(app).get('/api/resources');
    expect(res.status).toBe(200);
    expect(res.body.resources.length).toBeGreaterThan(0);
  });

  it('PUT /api/resources/:id - should update resource', async () => {
    const res = await request(app)
      .put(`/api/resources/${resourceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Title');
  });

  it('DELETE /api/resources/:id - should delete resource', async () => {
    const res = await request(app)
      .delete(`/api/resources/${resourceId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Deleted successfully');
  });
});
