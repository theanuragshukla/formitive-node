import { UserSession } from "../../utils/types";

declare global {
  namespace Express {
    interface Request {
      user: UserSession;
      uid?: string;
      deviceId: string;
    }
  }
}
