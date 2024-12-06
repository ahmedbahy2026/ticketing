import { customError } from './custom-error';

export class NotAuthorizationError extends customError {
  statusCode = 401;
  constructor() {
    super('Not Authorized');

    Object.setPrototypeOf(this, NotAuthorizationError.prototype);
  }
  serializeErrors() {
    return [{ message: 'Not Authorized' }];
  }
}
