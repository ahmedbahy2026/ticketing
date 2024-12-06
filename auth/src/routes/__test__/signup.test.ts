import request from 'supertest';
import app from '../../app';

it('returns a 201 on succeessful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'test1234' })
    .expect(201);
});

it('returns a 400 with an invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({ email: 'lkjsdf', password: 'test1234' })
    .expect(400);
});

it('returns a 400 with an invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: '1' })
    .expect(400);
});

it('returns a 400 with missing email and password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'hey@hello.hi' })
    .expect(400);
  await request(app)
    .post('/api/users/signup')
    .send({ password: 'password' })
    .expect(400);
  await request(app).post('/api/users/signup').send({}).expect(400);
});

it('disallow duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'hey@hello.hi', password: 'Gamed' })
    .expect(201);
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'hey@hello.hi', password: 'Gamed' })
    .expect(400);
});

it('sets a cookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({ email: 'hey@hello.hi', password: 'Gamed' })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
