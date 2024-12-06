import { requireAuth } from '@bahy_tickets/common';
import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const tickets = await Ticket.find();
  res.send(tickets);
});

export { router as indexTicketRouter };
