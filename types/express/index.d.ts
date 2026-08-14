import type { AuthTokenPayload } from "../auth.js";
import type { UserProfile } from "../user.js";

declare global {
  namespace Express {
    interface User extends UserProfile {}

    interface Request {
      auth?: AuthTokenPayload;
    }
  }
}