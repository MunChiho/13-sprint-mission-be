import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "../types/auth.js";

export function isAuthTokenPayload(payload: unknown): payload is AuthTokenPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as Record<string, unknown>).userId === "number" &&
    typeof (payload as Record<string, unknown>).email === "string"
  );
}

export function verifyAuthToken(token: string, secret: string): AuthTokenPayload {
  const payload = jwt.verify(token, secret);
  if (!isAuthTokenPayload(payload)) {
    throw new Error("유효하지 않은 토큰 payload입니다.");
  }
  return payload;
}