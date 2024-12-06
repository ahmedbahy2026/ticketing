import { Listener, OrderCancelledEvent, Subjects } from '@bahy_tickets/common';
import { queueGroupName } from './queue-grouop-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publisher/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // Fetch the ticket to be cancelled
    const ticket = await Ticket.findById(data.ticket.id);
    // If not found, returns an error
    if (!ticket) {
      throw new Error('The Ticket not found');
    }
    // unlock the ticket => clear the 'orderId' in the ticket
    ticket.set({ orderId: undefined });
    await ticket.save();

    // Publish an Event saying that 'Hey a ticket is cancelled'
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId
    });

    msg.ack();
  }
}
