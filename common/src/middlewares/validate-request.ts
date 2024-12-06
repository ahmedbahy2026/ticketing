import { NextFunction, Request, Response } from 'express';
import { requestValidationError } from '../errors/request-validation-error';
import { validationResult } from 'express-validator';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new requestValidationError(errors.array()));
    return;
  }
  next();
};
