import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { OrderCancelledEvent } from '@bahy_tickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  // Create an Instance of Listeners
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  // Create a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 400,
    userId: '123'
  });
  ticket.set({ orderId });
  await ticket.save();

  // Create a fake data
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id
    }
  };

  // Create a fake msg
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg, ticket };
};

it('cancels the order', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  const cancelledTicket = await Ticket.findById(ticket.id);

  expect(cancelledTicket!.orderId).not.toBeDefined();
  expect(cancelledTicket!.id).toEqual(ticket.id);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not ack the message if the ticket does not exist', async () => {
  const { listener, data, msg } = await setup();

  data.ticket.id = new mongoose.Types.ObjectId().toHexString();

  try {
    await listener.onMessage(data, msg);
  } catch (err) {
    expect(msg.ack).not.toHaveBeenCalled();
    return;
  }
  throw new Error('Should not reach this point');
});

it('publish a ticket-updated-event', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const updatedTicketData = (natsWrapper.client.publish as jest.Mock).mock
    .calls[0][1];

  expect(updatedTicketData.orderId).toBeUndefined();
});
