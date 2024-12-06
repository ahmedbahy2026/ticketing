import { OrderCancelledEvent, Publisher, Subjects } from '@bahy_tickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
