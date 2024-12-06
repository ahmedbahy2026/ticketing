import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  Subjects,
  requireAuth,
  validateRequest
} from '@bahy_tickets/common';
import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publisher/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

const router = express.Router();

router.post(
  '/',
  requireAuth,
  [
    body('ticketId')
      .notEmpty()
      .custom((input) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('An order must be attached to a ticket')
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const { ticketId } = req.body;
    console.log(ticketId);
    // 1) Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId);
    console.log(ticket);
    if (!ticket) {
      console.log('Not Found');
      return next(new NotFoundError());
    }

    // 2) Make sure that the ticket is not already reserved
    // Run a query to look at all order. Find an order where this ticket is the ticket we just found
    // and the order's status is not cancelled
    // If we find such an order , then the ticket is reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      return next(new BadRequestError('Ticket is already reserved'));
    }

    // 3) Calculate the expiration Date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // 4) Build the order and save it in the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket
    });
    await order.save();

    // 5) Publish an Event Saying that an order is created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      userId: order.userId,
      status: OrderStatus.Created,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price
      }
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
