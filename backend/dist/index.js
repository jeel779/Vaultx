import dotenv from "dotenv";
import http from "http";
import { app } from "./app.js";
import { initializeSocket } from "./lib/socket.js";
dotenv.config({
    path: "./.env"
});
const server = http.createServer(app);
// Initialize Socket.io
initializeSocket(server);
const port = process.env.PORT || 8000;
server.listen(port, () => {
    console.log(`⚙️ Server is running at port : ${port}`);
});
//# sourceMappingURL=index.js.map