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

app.get('/ok', (req, res) => {
  res.send('ok');
});
app.use(currentUser);
app.use('/api/tickets', rootRouter);
app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export default app;
