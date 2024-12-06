import { NextFunction, Request, Response } from 'express';
import { NotAuthorizationError } from '../errors/not-authorization-error';

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.currentUser) {
    next(new NotAuthorizationError());
    return;
  }
  next();
};
