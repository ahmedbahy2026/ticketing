import { customError } from './custom-error';

export class databaseConnectionError extends customError {
  reason = 'Error connecting to Database';
  statusCode = 500;
  constructor() {
    super('Error connecting to Database');
    Object.setPrototypeOf(this, databaseConnectionError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
