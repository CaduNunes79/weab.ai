export class InternalServerError extends Error {
  constructor({ cause }) {
    super("Unexpected Error", {
      cause,
    });
    this.name = "InternalServerError";
    this.action = "Contact support";
    this.status_code = 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.status_code,
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor() {
    super("Method Not Allowed for this endpoint");
    this.name = "MethodNotAllowedError";
    this.action = "Please check the API documentation for allowed methods.";
    this.status_code = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.status_code,
    };
  }
}
