import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { BadRequestError } from '../errors/bad-request-error';

interface userPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: userPayload;
    }
  }
}

export const currentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session?.jwt) {
    next();
    // next(new BadRequestError('Invalid creditionals'));
    return;
  }
  try {
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as userPayload;
    req.currentUser = payload;
  } catch (err) {}
  next();
};
