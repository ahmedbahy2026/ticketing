import express, { Request, Response } from 'express';
import { currentUser } from '@bahy_tickets/common';
import { requireAuth } from '@bahy_tickets/common';

const router = express.Router();

router.post('/signout', (req: Request, res: Response) => {
  req.session = null;
  res.send({});
});

export { router as signoutRouter };
