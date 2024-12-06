import express from 'express';
import { createChargeRouter } from './new';

const router = express.Router();

router.use(createChargeRouter);

export { router as rootRouter };
