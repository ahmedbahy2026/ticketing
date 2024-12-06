import { NextFunction, Request, Response } from 'express';
import { customError } from '../errors/custom-error';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof customError) {
    res.status(err.statusCode).send({ errors: err.serializeErrors() });
  } else {
    console.error(err);
    res.status(400).send({
      message: 'Something went wrong'
    });
  }
};
