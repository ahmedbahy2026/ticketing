import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  var signin: (userId?: string) => string[];
}

global.signin = (userId?: string) => {
  const id = userId || new mongoose.Types.ObjectId().toHexString();
  const payload = { id, email: 'test@test.com' };
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const sessoin = { jwt: token };
  const sessionJson = JSON.stringify(sessoin);
  const base64 = Buffer.from(sessionJson).toString('base64');
  return [`session=${base64}`];
};

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY =
  'sk_test_51Pwgo6P30MQF7n3CBnAY9g5ERzJAR3VS0ZTq9u1J7CusjfmUp605JQAP35KeUynXTCAPg8lwetG1C2TW1sgJmlta00KaVBZh00';

let mongo: any;

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
