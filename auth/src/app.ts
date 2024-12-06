import express from 'express';
import cookieSession from 'cookie-session';

import { rootRouter } from './routes/root';
import { errorHandler } from '@bahy_tickets/common';
import { NotFoundError } from '@bahy_tickets/common';

require('express-async-errors');

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
  })
);

app.use('/api/users', rootRouter);
app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export default app;
