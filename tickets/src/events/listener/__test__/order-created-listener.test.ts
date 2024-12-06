import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { OrderCreatedEvent, OrderStatus, Subjects } from '@bahy_tickets/common';
import mongoose from 'mongoose';

const setup = async () => {
  // Create an Instance of Listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create a ticket and save it
  const ticket = Ticket.build({
    title: 'concert',
    price: 320,
    userId: 'hey'
  });
  await ticket.save();

  // Create a fake data
  const data: OrderCreatedEvent['data'] = {
    id: '123',
    version: 1,
    userId: 'hey',
    status: OrderStatus.Created,
    expiresAt: Date.now().toString(),
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg, ticket };
};

it('marks the ticket as being reserved', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
  expect(updatedTicket!.id).toEqual(ticket.id);
  expect(updatedTicket!.price).toEqual(ticket.price);
  expect(updatedTicket!.title).toEqual(ticket.title);
});

it('acks the message', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not acks the message if the ticket does not exist', async () => {
  const { listener, data, msg, ticket } = await setup();

  data.ticket.id = new mongoose.Types.ObjectId().toHexString();

  try {
    await listener.onMessage(data, msg);
  } catch (err) {
    expect(msg.ack).not.toHaveBeenCalled();
    return;
  }
  throw Error('Should not reach this point');
});

it('publishes a ticket-updated-event', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const updatedTicketData = (natsWrapper.client.publish as jest.Mock).mock
    .calls[0][1];
  // console.log(updatedTicketData);
  expect(updatedTicketData.orderId).toEqual(ticket.orderId);
});
