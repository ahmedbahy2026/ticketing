import { Publisher, Subjects, TicketCreatedEvent } from '@bahy_tickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
