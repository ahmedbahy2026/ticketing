import request from 'supertest';
import app from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 100
  });
  await ticket.save();
  return ticket;
};

it('fetch orders for an particular user', async () => {
  const user1 = global.signin();
  const user2 = global.signin();

  const ticket1 = await buildTicket();
  const ticket2 = await buildTicket();
  const ticket3 = await buildTicket();

  const { body: order1 } = await request(app)
    .post('/api/orders')
    .set('Cookie', user1)
    .send({ ticketId: ticket1.id })
    .expect(201);

  const { body: order2 } = await request(app)
    .post('/api/orders')
    .set('Cookie', user2)
    .send({ ticketId: ticket2.id })
    .expect(201);

  const { body: order3 } = await request(app)
    .post('/api/orders')
    .set('Cookie', user2)
    .send({ ticketId: ticket3.id })
    .expect(201);

  const response1 = await request(app)
    .get('/api/orders')
    .set('Cookie', user1)
    .send()
    .expect(200);

  const response2 = await request(app)
    .get('/api/orders')
    .set('Cookie', user2)
    .send()
    .expect(200);

  expect(response1.body.length).toEqual(1);
  expect(response1.body[0].id).toEqual(order1.id);
  expect(response1.body[0].ticket.id).toEqual(ticket1.id);

  expect(response2.body.length).toEqual(2);
  expect(response2.body[0].id).toEqual(order2.id);
  expect(response2.body[1].id).toEqual(order3.id);
  expect(response2.body[0].ticket.id).toEqual(ticket2.id);
  expect(response2.body[1].ticket.id).toEqual(ticket3.id);
});
