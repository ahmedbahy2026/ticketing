import request from 'supertest';
import app from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/order';
import { OrderStatus } from '@bahy_tickets/common';
import { natsWrapper } from '../../nats-wrapper';

it('return an error if the ticket is not found', async () => {
  const ticketId = new mongoose.Types.ObjectId();
  return request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId })
    .expect(404);
});

it('returns an error if the ticket is reserved', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 100
  });
  await ticket.save();

  const id = new mongoose.Types.ObjectId();
  const order = Order.build({
    userId: 'lksjdfkljlkjdsf',
    status: OrderStatus.Created,
    ticket,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000)
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserve a ticket', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 100
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it('emit an order created event', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 100
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

// it('return an unauthorized error(401) if the error is not authenticated', async () => {
//   const id = new mongoose.Types.ObjectId();
//   return request(app).post('/api/orders').send({ tickedId: id }).expect(401);
// });
// it('returns a bad requst error(400) if the provided data is invalid or missing', async () => {
//   await request(app).post('/api/orders').send({}).expect(400);
//   await request(app).post('/api/orders').send({ ticketId: 'asdf' }).expect(400);
// });
// it('', async () => {});
// it('', async () => {});
// it('', async () => {});
// it('', async () => {});
