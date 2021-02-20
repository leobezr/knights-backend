import { Server } from "socket.io";
import { createServer } from "http"
import createChat from "./chat.js";
import pve from "../service/endpoints/PVE.js";

export default function (app, port) {
   const SOCKET_PORT = port;

   const httpServer = createServer(app);
   const io = new Server(httpServer, {
      allowEIO3: true,
      transport: ['websocket'],
      auth: {
         token: "123"
      },
      cors: {
         origin: "http://localhost:8080",
         credentials: true,
         methods: ["GET", "POST"]
      }
   });

   io.on("connection", socket => {
      createChat(socket, io);
   })

   httpServer.listen(SOCKET_PORT, () => {
      console.log("listening on *:" + SOCKET_PORT);
   });

   pve(app, io);
}


