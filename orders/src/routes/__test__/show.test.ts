import request from 'supertest';
import mongoose from 'mongoose';
import { OrderStatus } from '@bahy_tickets/common';
import app from '../../app';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/order';

it('fetches the order', async () => {
  // create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 40
  });
  await ticket.save();

  // make a request to build an order with this ticket
  const cookie = global.getCookie();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make request to fectch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error if one user tries to fetch another user order', async () => {
  // create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 40
  });
  await ticket.save();

  // make a request to build an order with this ticket
  const cookie1 = global.getCookie();
  const cookie2 = global.getCookie();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie1)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make request to fectch the order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', cookie2)
    .send()
    .expect(401);
});
