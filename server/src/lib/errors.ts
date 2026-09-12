export class AppError extends Error {
  status: number;
  code: string;

  constructor(status: number, message: string, code = "ERR_APP") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const isAppError = (e: unknown): e is AppError => e instanceof AppError;

export const badRequest = (msg: string) => new AppError(400, msg, "ERR_BAD_REQUEST");
export const unauthorized = (msg = "Authentication required") =>
  new AppError(401, msg, "ERR_UNAUTHORIZED");
export const forbidden = (msg = "Forbidden") => new AppError(403, msg, "ERR_FORBIDDEN");
export const notFound = (msg = "Resource not found") => new AppError(404, msg, "ERR_NOT_FOUND");
export const conflict = (msg: string) => new AppError(409, msg, "ERR_CONFLICT");
export const tooMany = (msg = "Too many requests") =>
  new AppError(429, msg, "ERR_RATE_LIMIT");
export const serverError = (msg = "Internal server error") =>
  new AppError(500, msg, "ERR_SERVER");