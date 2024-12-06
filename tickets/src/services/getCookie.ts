import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const getCookie = () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const payload = { id, email: 'test@test.com' };
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const sessoin = { jwt: token };
  const sessionJson = JSON.stringify(sessoin);
  const base64 = Buffer.from(sessionJson).toString('base64');
  return [`session=${base64}`];
};
