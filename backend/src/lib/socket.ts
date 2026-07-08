import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

export const onlineUsers = new Map<string, string>();

export let io: Server;

export const initializeSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("setup", (userId: string) => {
            socket.data.userId = userId;

            onlineUsers.set(userId, socket.id);

            io.emit("get-online-users", Array.from(onlineUsers.keys()));
            console.log("User setup completed:", userId);
        });

        socket.on("disconnect", () => {
            if (socket.data.userId) {
                onlineUsers.delete(socket.data.userId);
                io.emit("get-online-users", Array.from(onlineUsers.keys()));
            }

            console.log("User disconnected:", socket.id);
        });
    });
};
