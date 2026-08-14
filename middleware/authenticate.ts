import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { verifyAuthToken } from "../lib/authToken.js";

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "인증이 필요합니다." });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    req.auth = verifyAuthToken(token, env.jwtSecret);
    next();
  } catch {
    res.status(401).json({ message: "유효하지 않거나 만료된 토큰입니다." });
  }
}

export function optionalAuthenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      req.auth = verifyAuthToken(authHeader.split(" ")[1], env.jwtSecret);
    } catch {
      /* 비로그인으로 처리 */
    }
  }
  next();
}