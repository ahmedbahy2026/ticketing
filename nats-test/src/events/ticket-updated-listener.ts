import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import { Subjects } from './subjects';
import { TicketUpdatedEvent } from './ticket-updated-event';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = 'payment-service';

  onMessage(data: TicketUpdatedEvent['data'], msg: Message): void {
    console.log('Event Received: ', data);
    msg.ack();
  }
}
