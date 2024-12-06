import mongoose from 'mongoose';

import app from './app';

const start = async () => {
  console.log('Starting up....');
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  try {
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
