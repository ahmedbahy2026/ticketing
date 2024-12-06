import { ValidationError } from 'express-validator';
import { customError } from './custom-error';

export class requestValidationError extends customError {
  public readonly errors: ValidationError[];
  public readonly statusCode = 400;

  constructor(errors: ValidationError[]) {
    super('Invalid Request Parameters');
    this.errors = errors;

    Object.setPrototypeOf(this, requestValidationError.prototype);
  }

  // Method to format errors for API responses
  serializeErrors() {
    return this.errors.map((err) => {
      if (err.type === 'field') {
        return { message: err.msg as string, field: err.path as string };
      }
      return { message: err.msg as string };
    });
  }
}
