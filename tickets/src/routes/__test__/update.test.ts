import request from 'supertest';
import app from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Subjects } from '@bahy_tickets/common';
import { Ticket } from '../../models/ticket';

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  return request(app)
    .put(`/api/tickets${id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(404);
});

it('returns a 401 if the user is not logged in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'SomeTile', price: 50 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .send({ title: 'NewTitle', price: 100 })
    .expect(401);
});

it('returns a 401 if the user try to update a ticket he does not own', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'SomeTile', price: 50 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({ title: 'NewTitle', price: 100 })
    .expect(401);
});

it('returns a 400 if the user does not provide the title and the price', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'SomeTile', price: 50 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'NewTitle' })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ price: 120 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'NewTitle', price: -120 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({})
    .expect(400);
});

it('returns a 200 if the user is logged in and the user try to update its own ticket', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'SomeTile', price: 50 })
    .expect(201);

  const newTitle = 'NewTitle',
    newPrice = 100;

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: newTitle, price: newPrice })
    .expect(200);

  const updatedResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(updatedResponse.body.title).toEqual(newTitle);
  expect(updatedResponse.body.price).toEqual(newPrice);
});

it('publish an event', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'SomeTile', price: 50 })
    .expect(201);

  const newTitle = 'NewTitle',
    newPrice = 100;

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: newTitle, price: newPrice })
    .expect(200);

  const updatedResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(updatedResponse.body.title).toEqual(newTitle);
  expect(updatedResponse.body.price).toEqual(newPrice);

  expect(natsWrapper.client.publish).toHaveBeenNthCalledWith(
    2,
    Subjects.TicketUpdated,
    expect.any(String),
    expect.any(Function)
  );
});

it('returns error if user tries to update a reserved ticket', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'SomeTile', price: 50 })
    .expect(201);

  const newTitle = 'NewTitle',
    newPrice = 100;

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: newTitle, price: newPrice })
    .expect(400);
});
