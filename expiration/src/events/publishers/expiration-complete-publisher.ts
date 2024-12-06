import {
  ExpriationCompletedEvent,
  Publisher,
  Subjects
} from '@bahy_tickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpriationCompletedEvent> {
  readonly subject = Subjects.ExpirationCompleted;
}
