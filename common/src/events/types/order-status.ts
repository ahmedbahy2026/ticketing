export enum OrderStatus {
  // when the order has been created, but the ticket it is trying to order has not been reserved
  Created = 'created',

  // the ticket the order is trying to reserve has already been reserved.
  // the order expires before payment
  Cancelled = 'cancelled',

  // the order successufully reserved the ticket
  AwaitingPayment = 'awaiting:payment',

  // the order has reserved the ticket and the user has provided payment
  Completed = 'completed'
}
