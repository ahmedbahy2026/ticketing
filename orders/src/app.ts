import express from 'express';
import cookieSession from 'cookie-session';
import { currentUser, errorHandler } from '@bahy_tickets/common';
import { NotFoundError } from '@bahy_tickets/common';

import { rootRouter } from './routes/root';

require('express-async-errors');

const app = express();

app.use('/hey', (req, res) => {
  res.send('hey');
});

app.set('trust proxy', true);
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
  })
);

app.use(currentUser);
app.use('/api/orders', rootRouter);
app.all('*', async () => {
  console.log('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');
  throw new NotFoundError();
});

app.use(errorHandler);

export default app;
