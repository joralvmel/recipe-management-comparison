import request from 'supertest';
import app from '@src/index';

describe('Auth Routes Integration Tests', () => {
  describe('POST /auth/register', () => {
    it('should register a new user and return user details', async () => {
      const res = await request(app).post('/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Test User');
      expect(res.body.email).toBe('test@example.com');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app).post('/auth/register').send({
        email: 'missing@example.com',
        password: 'password123',
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/auth/register').send({
        name: 'Login Test',
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('should login an existing user and return a token', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'login@example.com',
        password: 'password123',
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 401 for invalid credentials', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'login@example.com',
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });
});
