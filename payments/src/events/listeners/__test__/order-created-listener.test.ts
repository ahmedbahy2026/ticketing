import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreateListener } from '../order-created-listener';
import { Order } from '../../../models/order';
import { OrderCreatedEvent, OrderStatus } from '@bahy_tickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new OrderCreateListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: '123',
    status: OrderStatus.Created,
    expiresAt: 'tomorow',
    ticket: {
      id: 'asdf',
      price: 100
    }
  };

  // @ts-ignoreawait
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg };
};

it('replicates the order info', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  console.log(order);
  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
