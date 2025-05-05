import { Server, Socket } from "socket.io";
import { getDocStatus } from "../utils/ActivityHelper";

class SocketService {
  private static instance: SocketService;
  io: Server;
  private initialized: boolean = false;

  private constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: ["http://localhost:3000"],
        credentials: true,
      },
    });
    this.setupSocketEvents();
  }

  private setupSocketEvents() {
    this.io.on("connection", (socket: Socket) => {
      console.log("Client connected");
      socket.on("join", (data) => this.handleJoin(socket, data));
      socket.on("get_status", (data) => this.handleGetStatus(socket, data));
      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  }

  private handleJoin(socket: Socket, data: any) {
    const room = data.uid;
    console.log(`>>> Joining room: ${room}`);
    socket.join(room);
    this.emitToRoom(room, "status", { uid: room, status: "CONNECTED", type: "status" });
    socket.emit("joined", { status: "JOINED", type: "status" });
    this.handleGetStatus(socket, data);
  }

  private async handleGetStatus(socket: Socket, data: any) {
    const room = data.uid;
    const { pdf_status, json_status } = await getDocStatus(room);
    socket.emit("status_both", { uid: room, pdf_status, json_status});
  }

  private emitToRoom(room: string, event: string, data: any) {
    try {
      console.log(`Emitting to room: ${room}`);
      this.io.to(room).emit(event, data);
    } catch (error) {
      console.error(`Error emitting to room: ${room} - ${error}`);
    }
  }

  public static getInstance(server: any): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService(server);
    }
    return SocketService.instance;
  }

  public static initialize(server: any) {
    const instance = SocketService.getInstance(server);

    if (instance.initialized) {
      console.warn("SocketService already initialized");
      return;
    }

    console.log("Initializing SocketService");
    instance.initialized = true;
    console.log("SocketService initialized");
  }
}

export default SocketService;

