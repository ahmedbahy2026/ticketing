import { Subjects } from './subjects';

export interface ExpriationCompletedEvent {
  subject: Subjects.ExpirationCompleted;
  data: {
    orderId: string;
  };
}
