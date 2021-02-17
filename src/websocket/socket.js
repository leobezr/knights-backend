import { Server } from "socket.io";
import { createServer } from "http"
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import createChat from "./chat.js";

export default function (app, port) {
   const __dirname = dirname(fileURLToPath(import.meta.url));
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


   app.get('/', (req, res) => {
      res.sendFile(__dirname + '/index.html');
   });

   io.on("connection", socket => {
      createChat(socket, io)
   })

   httpServer.listen(SOCKET_PORT, () => {
      console.log("listening on *:" + SOCKET_PORT);
   });
}


