const { register, login, getCurrentUser } = require('../controllers/authController');
const User = require('../models/User');
const Token = require('../models/Token');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../models/User');
jest.mock('../models/Token');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      headers: {
        authorization: 'Bearer mock-token',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should return 400 if user already exists', async () => {
      req.body = { email: 'test@example.com' };
      User.findOne.mockResolvedValue(true);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });

    it('should create a new user and return 201', async () => {
      req.body = {
        username: 'Ankita',
        email: 'ankita@example.com',
        password: 'secret',
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-password');
      User.create.mockResolvedValue({ username: 'Ankita' });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User created',
        user: 'Ankita',
      });
    });
  });

  describe('login', () => {
    it('should return 400 if email or password missing', async () => {
      req.body = {};
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
    });

    it('should return 404 if user not found', async () => {
      req.body = { email: 'test@example.com', password: 'secret' };
      User.findOne.mockResolvedValue(null);
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 400 if password is invalid', async () => {
      req.body = { email: 'test@example.com', password: 'wrong' };
      const fakeUser = { email: 'test@example.com', password: 'hashed' };

      User.findOne.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return 200 with token if login is successful', async () => {
      req.body = { email: 'ankita@example.com', password: 'secret' };
      const user = {
        _id: 'user123',
        email: 'ankita@example.com',
        password: 'hashed',
        username: 'Ankita',
      };

      User.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-token');

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: 'mock-token',
        user: {
          id: 'user123',
          username: 'Ankita',
          email: 'ankita@example.com',
        },
      });
    });
  });

  // ✅ Additional coverage test
  describe('getCurrentUser', () => {
    it('should return 401 if token document is not found (expired)', async () => {
      Token.findOne.mockResolvedValue(null); // simulate token not found
      await getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token expired' });
    });
  });
});
