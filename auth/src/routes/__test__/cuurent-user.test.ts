import request from 'supertest';
import app from '../../app';
import { signupAndGetCookie } from '../../services/signupAndGetCookie';

it('responds with details about the current user', async () => {
  const cookie = await signupAndGetCookie('test@test.com', 'test1234');

  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('responds with null if not authenticated', async () => {
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);

  expect(response.body.currentUser).toBeNull();
});
