import { OrderCreatedEvent, Publisher, Subjects } from '@bahy_tickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
