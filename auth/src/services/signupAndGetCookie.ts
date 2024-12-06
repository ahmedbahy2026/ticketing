import request from 'supertest';
import app from '../app';

export const signupAndGetCookie = async (email: string, password: string) => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({ email, password })
    .expect(201);
  const cookie = response.get('Set-Cookie');
  if (!cookie) {
    throw Error('cookie not set after signup');
  }
  return cookie;
};
