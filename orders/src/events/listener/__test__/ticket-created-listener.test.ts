import { TicketCreatedEvent } from '@bahy_tickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);
  // Create a fake data event
  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 130,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString()
  };
  // Craete a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg };
};

it('creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup();
  // Call the onMessage() function with the data object + message object
  await listener.onMessage(data, msg);
  // Wrirte assersions to make sure that a tikcet was creared
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();
  // Call the onMessage() function with the data object + message object
  await listener.onMessage(data, msg);
  // Wrirte assersions to make sure that ack is called
  expect(msg.ack).toHaveBeenCalled();
});
