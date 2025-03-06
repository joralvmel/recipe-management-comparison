import request from 'supertest';
import express from 'express';
import authRoutes from '@interfaces/routes/authRoutes';
import { registerController, loginController } from '@interfaces/controllers/authController';

jest.mock('@interfaces/controllers/authController');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should call registerController', async () => {
      (registerController as jest.Mock).mockImplementation((req, res) => res.status(201).send());

      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(registerController).toHaveBeenCalled();
    });

    it('should return 400 if registerController fails', async () => {
      (registerController as jest.Mock).mockImplementation((req, res) => res.status(400).send());

      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(400);
      expect(registerController).toHaveBeenCalled();
    });
  });

  describe('POST /auth/login', () => {
    it('should call loginController', async () => {
      (loginController as jest.Mock).mockImplementation((req, res) => res.status(200).send());

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(loginController).toHaveBeenCalled();
    });

    it('should return 401 if loginController fails', async () => {
      (loginController as jest.Mock).mockImplementation((req, res) => res.status(401).send());

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(401);
      expect(loginController).toHaveBeenCalled();
    });
  });
});
