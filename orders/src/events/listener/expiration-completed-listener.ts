import {
  ExpriationCompletedEvent,
  Listener,
  OrderStatus,
  Subjects
} from '@bahy_tickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { OrderCancelledPublisher } from '../publisher/order-cancelled-publisher';
import { Order } from '../../models/order';

export class ExpirationCompletedListener extends Listener<ExpriationCompletedEvent> {
  readonly subject = Subjects.ExpirationCompleted;
  queueGroupName = queueGroupName;
  async onMessage(data: ExpriationCompletedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');
    if (!order) {
      throw new Error('Order not found');
    }
    if (order.status === OrderStatus.Completed) {
      return msg.ack();
    }

    order.set({
      status: OrderStatus.Cancelled
    });
    await order.save();

    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id
      }
    });

    msg.ack();
  }
}
