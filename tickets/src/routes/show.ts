import express, { NextFunction, Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { NotFoundError } from '@bahy_tickets/common';

const router = express.Router();

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    next(new NotFoundError());
    return;
  }
  res.send(ticket);
});

export { router as showTicketRouter };
