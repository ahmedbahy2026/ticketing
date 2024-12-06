import express from 'express';
import { indexOrderRouter } from '.';
import { showOrderRouter } from './show';
import { newOrderRouter } from './new';
import { deleteOrderRouter } from './delete';

const router = express.Router();

router.use(indexOrderRouter);
router.use(showOrderRouter);
router.use(newOrderRouter);
router.use(deleteOrderRouter);

export { router as rootRouter };
