import { Publisher, Subjects, TicketUpdatedEvent } from '@bahy_tickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
