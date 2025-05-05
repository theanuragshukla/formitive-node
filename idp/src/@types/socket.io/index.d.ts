import { JWT_PAYLOAD } from "../../constants";

declare module "socket.io" {
  interface Socket {
    user: JWT_PAYLOAD;
  }
}
