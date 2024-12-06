import request from 'supertest';
import app from '../../app';

it('returns a 400 with an not existing email', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({ email: 'lkjsdf', password: 'test1234' })
    .expect(400);
});

it('returns a 400 with missing email and password', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({ email: 'hey@hello.hi' })
    .expect(400);

  await request(app)
    .post('/api/users/signin')
    .send({ password: 'password' })
    .expect(400);

  await request(app).post('/api/users/signin').send({}).expect(400);
});

it('fails when an incorrect password is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'test1234' })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'hello' })
    .expect(400);
});

it('responds a 200 with a cookie when given valid credentials', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'test1234' })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'test1234' })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
