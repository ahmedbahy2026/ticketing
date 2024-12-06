import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

let mongo: any;

declare global {
  var getCookie: () => string[];
}

global.getCookie = () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const payload = { id, email: 'test@test.com' };
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const sessoin = { jwt: token };
  const sessionJson = JSON.stringify(sessoin);
  const base64 = Buffer.from(sessionJson).toString('base64');
  return [`session=${base64}`];
};

jest.mock('../nats-wrapper');

beforeAll(async () => {
  process.env.JWT_KEY = 'asdf';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    await Promise.all(collections.map((collection) => collection.deleteMany()));
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});
