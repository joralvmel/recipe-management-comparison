import request from 'supertest';
import app from '@src/index';

export const setupAuth = async () => {
  await request(app).post('/auth/register').send({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  });

  const res = await request(app).post('/auth/login').send({
    email: 'test@example.com',
    password: 'password123',
  });

  return res.body.token;
};
