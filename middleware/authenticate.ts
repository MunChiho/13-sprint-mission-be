import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import type { AuthTokenPayload } from "../types/auth.js";

function isAuthTokenPayload(payload: unknown): payload is AuthTokenPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as Record<string, unknown>).userId === "number" &&
    typeof (payload as Record<string, unknown>).email === "string"
  );
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "인증이 필요합니다." });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (!isAuthTokenPayload(payload)) {
      throw new Error("유효하지 않은 토큰 payload입니다.");
    }
    req.auth = payload;
    next();
  } catch {
    res.status(401).json({ message: "유효하지 않거나 만료된 토큰입니다." });
  }
}

export function optionalAuthenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(authHeader.split(" ")[1], env.jwtSecret);
      if (isAuthTokenPayload(payload)) {
        req.auth = payload;
      }
    } catch {
      /* 비로그인으로 처리 */
    }
  }
  next();
}