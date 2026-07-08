import { Server } from "socket.io";
export const onlineUsers = new Map();
export let io;
export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);
        socket.on("setup", (userId) => {
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
//# sourceMappingURL=socket.js.map