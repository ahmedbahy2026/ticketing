import express, { NextFunction, Request, Response } from 'express';
import {
  BadRequestError,
  NotAuthorizationError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest
} from '@bahy_tickets/common';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { natsWrapper } from '../nats-wrapper';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';

const router = express.Router();

router.post(
  '/',
  requireAuth,
  [
    body('orderId')
      .isMongoId()
      .notEmpty()
      .withMessage('orderId must be provided'),
    body('token').notEmpty().withMessage('token must be provided')
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId, token } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return next(new NotFoundError());
    }
    if (order.userId !== req.currentUser!.id) {
      return next(new NotAuthorizationError());
    }
    if (order.status === OrderStatus.Cancelled) {
      return next(new BadRequestError('This order was cancelled'));
    }

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: 'tok_visa'
    });

    const payment = Payment.build({
      orderId,
      stripeId: charge.id
    });
    await payment.save();

    /* Optional await keyword */
    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
