import type { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "AppError";
  }
}

export function createError(status: number, message: string): AppError {
  return new AppError(status, message);
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  const status = err instanceof AppError ? err.status : 500;
  const message = err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
  res.status(status).json({ message });
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ message: "요청한 리소스를 찾을 수 없습니다." });
}