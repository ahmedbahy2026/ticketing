import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@bahy_tickets/common';
import { queueGroupName } from './queue-grouop-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publisher/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Find the ticket the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // If no ticket, throw an error
    if (!ticket) {
      throw new Error('Ticket Not Found');
    }

    // Mark the ticket as being reserved
    ticket.set({ orderId: data.id });

    // Save the ticket
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId
    });

    // Ack the message
    msg.ack();
  }
}
