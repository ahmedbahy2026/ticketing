import request from 'supertest';
import app from '../../app';
import { getCookie } from '../../services/getCookie';
import mongoose from 'mongoose';

it(`responds a 404 Not Found if there's no a tikcet with that id`, async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  return request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it(`responds a 200 OK if there's a tikcet with that id`, async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', getCookie())
    .send({ title: 'SomeTitle', price: 100 })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual('SomeTitle');
  expect(ticketResponse.body.price).toEqual(100);
});
