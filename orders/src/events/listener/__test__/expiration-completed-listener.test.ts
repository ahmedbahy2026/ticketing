import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompletedListener } from '../expiration-completed-listener';
import {
  ExpriationCompletedEvent,
  OrderStatus,
  Subjects
} from '@bahy_tickets/common';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new ExpirationCompletedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 400,
    title: 'concert'
  });
  await ticket.save();

  const order = Order.build({
    userId: '123',
    status: OrderStatus.Cancelled,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    ticket
  });
  await order.save();

  const data: ExpriationCompletedEvent['data'] = {
    orderId: order.id
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg, ticket, order };
};

it('updates the order status to be cancelled', async () => {
  const { listener, data, msg, ticket, order } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, data, msg, ticket, order } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('emit an order-cancelled-event', async () => {
  const { listener, data, msg, ticket, order } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const updatedOrderData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  console.log(updatedOrderData);
  console.log(updatedOrderData['id']);
  expect(updatedOrderData.id).toEqual(order.id);
  expect(updatedOrderData.ticket.id).toEqual(ticket.id);

  // expect(updatedOrderData.)/
});

it('does not ack the message if the order does not exist', async () => {
  const { listener, data, msg, ticket, order } = await setup();

  data.orderId = new mongoose.Types.ObjectId().toHexString();

  try {
    await listener.onMessage(data, msg);
  } catch (err) {
    expect(msg.ack).not.toHaveBeenCalled();
    return;
  }
  throw new Error('Should not reach this point');
});
