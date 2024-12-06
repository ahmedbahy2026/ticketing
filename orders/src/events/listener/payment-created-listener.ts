import {
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects
} from '@bahy_tickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class PaymetnCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);
    if (!order) {
      throw new Error('Order Not Found');
    }
    order.set({ status: OrderStatus.Completed });
    await order.save();

    // we should publish an event as the order updated "OrderUpdatedEvent",
    // but we don't expect any change on the order after the completed status
    // so we won't publish this event

    msg.ack();
  }
}
