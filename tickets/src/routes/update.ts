import express, { NextFunction, Request, Response } from 'express';
import {
  BadRequestError,
  NotAuthorizationError,
  NotFoundError,
  requireAuth,
  validateRequest
} from '@bahy_tickets/common';
import { Ticket } from '../models/ticket';
import { body } from 'express-validator';
import { TicketUpdatedPublisher } from '../events/publisher/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
  '/:id',
  requireAuth,
  [
    body('title').notEmpty().withMessage('Ticket Cannot have a null title'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage(`Ticket's price must be positive value`)
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return next(new NotFoundError());
    }

    if (ticket.orderId) {
      return next(new BadRequestError('cannot edit a reserved ticket'));
    }

    if (ticket.userId !== req.currentUser?.id) {
      return next(new NotAuthorizationError());
    }
    const { title, price } = req.body;
    // await Ticket.findByIdAndUpdate(req.params.id, { title, price });
    ticket.set({ title, price });
    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
