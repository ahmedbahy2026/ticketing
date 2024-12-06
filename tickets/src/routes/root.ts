import express from 'express';
import { createTicketRouter } from './new';
import { showTicketRouter } from './show';
import { indexTicketRouter } from '.';
import { updateTicketRouter } from './update';

const router = express.Router();

router.use(createTicketRouter);
router.use(showTicketRouter);
router.use(indexTicketRouter);
router.use(updateTicketRouter);

export { router as rootRouter };
