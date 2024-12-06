import {
  NotAuthorizationError,
  NotFoundError,
  OrderStatus,
  requireAuth
} from '@bahy_tickets/common';
import express, { NextFunction, Request, Response } from 'express';
import { Order } from '../models/order';
import { OrderCancelledPublisher } from '../events/publisher/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
  '/:orderId',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');
    if (!order) {
      return next(new NotFoundError());
    }
    if (order.userId !== req.currentUser!.id) {
      return next(new NotAuthorizationError());
    }
    order.status = OrderStatus.Cancelled;
    await order.save();
    console.log(order);

    // publish an event saying that this event was cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id
      }
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
