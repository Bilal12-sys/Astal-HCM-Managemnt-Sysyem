class AppError extends Error {
  constructor(message, status = 500, code, errors) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
