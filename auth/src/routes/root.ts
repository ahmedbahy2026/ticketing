import express from 'express';
import { currentUserRouter } from './current-user';
import { signinRouter } from './signin';
import { signoutRouter } from './signout';
import { signupRouter } from './signup';

const router = express.Router();

router.use(signupRouter);
router.use(currentUserRouter);
router.use(signinRouter);
router.use(signoutRouter);

export { router as rootRouter };
