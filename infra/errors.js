export class InternalServerError extends Error {
  constructor({ cause, statusCode }) {
    super("Unexpected Error", {
      cause,
    });
    this.name = "InternalServerError";
    this.action = "Contact support";
    this.statusCode = statusCode || 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  constructor({ cause, message }) {
    super(message || "Service currently unavailable", {
      cause,
    });
    this.name = "ServiceError";
    this.action = "Check if the service is currently available";
    this.statusCode = 503;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor() {
    super("Method Not Allowed for this endpoint");
    this.name = "MethodNotAllowedError";
    this.action = "Please check the API documentation for allowed methods.";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.statusCode,
    };
  }
}
