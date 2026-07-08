import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
export declare const onlineUsers: Map<string, string>;
export declare let io: Server;
export declare const initializeSocket: (server: HttpServer) => void;
//# sourceMappingURL=socket.d.ts.map