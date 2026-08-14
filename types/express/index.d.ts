import type { AuthTokenPayload } from "../auth";
import type { UserProfile } from "../user";

declare global {
  namespace Express {
    interface User extends UserProfile {}

    interface Request {
      auth?: AuthTokenPayload;
    }
  }
}