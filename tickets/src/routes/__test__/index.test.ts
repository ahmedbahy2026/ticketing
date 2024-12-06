import request from 'supertest';
import app from '../../app';

const createTicket = () => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'SomeTitle', price: 200 })
    .expect(201);
};

it('Responds a 401 NotAuthenticated  if the user is not signed in', async () => {
  return request(app).get('/api/tickets').send().expect(401);
});

it('Responds a 200 OK response if the user is authenticated', async () => {
  return request(app)
    .get('/api/tickets')
    .set('Cookie', global.signin())
    .send()
    .expect(200);
});

it('can fetch a list of tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app)
    .get('/api/tickets')
    .set('Cookie', global.signin())
    .send()
    .expect(200);
  expect(response.body.length).toEqual(5);
});
