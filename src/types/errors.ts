export class AfroMessageError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly raw: unknown,
  ) {
    super(message);
    this.name = "AfroMessageError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AfroAuthError extends AfroMessageError {
  constructor(raw: unknown) {
    super("Invalid or missing API key", 401, raw);
    this.name = "AfroAuthError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AfroRateLimitError extends AfroMessageError {
  constructor(raw: unknown) {
    super("Rate limit exceeded", 429, raw);
    this.name = "AfroRateLimitError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AfroValidationError extends AfroMessageError {
  constructor(message: string) {
    super(message, 400, null);
    this.name = "AfroValidationError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
