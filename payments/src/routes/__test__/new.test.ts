import request from 'supertest';
import app from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@bahy_tickets/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

// jest.mock('../../stripe');

it('returns a 404 error if the order not found', async () => {
  return request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      orderId: new mongoose.Types.ObjectId().toHexString(),
      token: 'lkjsd'
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that doesnot belong to the user', async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: orderId,
    version: 0,
    price: 200,
    userId: 'asdf',
    status: OrderStatus.Created
  });
  await order.save();

  return request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      orderId,
      token: 'lkjsd'
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: orderId,
    version: 0,
    price: 200,
    userId,
    status: OrderStatus.Cancelled
  });
  await order.save();

  return request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      orderId,
      token: 'lkjsd'
    })
    .expect(400);
});

// Using Option1: Mock function
// it('returns a 201 with valid inputs', async () => {
//   const orderId = new mongoose.Types.ObjectId().toHexString();
//   const userId = new mongoose.Types.ObjectId().toHexString();
//   const order = Order.build({
//     id: orderId,
//     version: 0,
//     price: 200,
//     userId,
//     status: OrderStatus.Created
//   });
//   await order.save();

//   await request(app)
//     .post('/api/payments')
//     .set('Cookie', global.signin(userId))
//     .send({ orderId, token: 'tok_visa' })
//     .expect(201);

//   const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
//   expect(chargeOptions.currency).toEqual('usd');
//   expect(chargeOptions.source).toEqual('tok_visa');
//   expect(chargeOptions.amount).toEqual(order.price * 100);
// });

// Using Option2: More Realistic testing
it('returns a 201 with valid inputs', async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: orderId,
    version: 0,
    price,
    userId,
    status: OrderStatus.Created
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({ orderId, token: 'tok_visa' })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find(
    (charge) => charge.amount === price * 100
  );

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.amount).toEqual(price * 100);
  expect(stripeCharge!.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId,
    stripeId: stripeCharge!.id
  });

  expect(payment).not.toBeNull();
});
