import { requireAuth, validateRequest } from '@bahy_tickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publisher/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/',
  requireAuth,
  [
    body('title').notEmpty().withMessage('Ticket must have a title'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage(`Ticket's price must be positive value`)
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    console.log('new ticket');
    const { title, price } = req.body;
    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id
    });
    await ticket.save();

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    });

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
