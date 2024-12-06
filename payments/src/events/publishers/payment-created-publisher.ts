import { PaymentCreatedEvent, Publisher, Subjects } from '@bahy_tickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
