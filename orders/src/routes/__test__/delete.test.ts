import request from 'supertest';
import app from '../../app';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/order';
import mongoose from 'mongoose';
import { OrderStatus } from '@bahy_tickets/common';
import { natsWrapper } from '../../nats-wrapper';

it('returns an authorized error if one user tires to delete another user order', async () => {
  // create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 50
  });
  await ticket.save();

  // send a request to make an order with this order
  const cookie1 = global.signin();
  const cookie2 = global.signin();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie1)
    .send({ ticketId: ticket.id })
    .expect(201);

  // try to delete the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', cookie2)
    .send()
    .expect(401);
});

it('returns an not-found error the order doesnot exist', async () => {
  // create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 50
  });
  await ticket.save();

  const orderId = new mongoose.Types.ObjectId().toHexString();

  // try to delete the order
  await request(app)
    .delete(`/api/orders/${orderId}`)
    .set('Cookie', global.signin())
    .send()
    .expect(404);
});

it('returns an authorized error if the user is not signed in', async () => {
  // create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 50
  });
  await ticket.save();

  // send a request to make an order with this order
  const cookie1 = global.signin();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie1)
    .send({ ticketId: ticket.id })
    .expect(201);

  // try to delete the order
  await request(app).delete(`/api/orders/${order.id}`).send().expect(401);
});

it('delete the order if everything is OK', async () => {
  // create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 50
  });
  await ticket.save();

  // send a request to make an order with this order
  const cookie = global.signin();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  // try to delete the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(204);

  const deletedOrder = await Order.findById(order.id);
  console.log(deletedOrder);
  expect(deletedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an order cancelled event', async () => {
  // create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 50
  });
  await ticket.save();

  // send a request to make an order with this order
  const cookie = global.signin();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  // try to delete the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(204);

  const deletedOrder = await Order.findById(order.id);
  console.log(deletedOrder);
  expect(deletedOrder!.status).toEqual(OrderStatus.Cancelled);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
