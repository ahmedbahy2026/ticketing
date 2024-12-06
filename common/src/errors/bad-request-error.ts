import { customError } from './custom-error';

export class BadRequestError extends customError {
  statusCode = 400;
  constructor(public message: string) {
    super(message);

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
