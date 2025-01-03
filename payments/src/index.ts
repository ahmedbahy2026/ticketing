import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';
import app from './app';
import { OrderCreateListener } from './events/listeners/order-created-listener';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on('close', () => {
      console.log('NATS Disconnected');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new OrderCreateListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Succeffully connected to DB');
  } catch (err) {
    console.error('Cannot connect to DB');
  }

  const PORT = 3000;
  app.listen(PORT, () =>
    console.log(`Listening to port ${PORT}!!!!!!!!!hello`)
  );
};

start();
