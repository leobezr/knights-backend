import { joinUser, removeUser } from "./userController.js";

export default function (socket, io) {
   let globalRoom = "";

   socket.on("joinRoom", userData => {
      let newUser = joinUser(socket.id, userData.nickname, "global");

      globalRoom = newUser.room;
      socket.join(globalRoom);

      io.to(globalRoom).emit("chatDispatch", {
         id: socket.id,
         nickname: newUser.nickname,
         system: "connect"
      });

      socket.on("disconnect", () => {
         let userLeft = removeUser(socket.id);

         if (userLeft) {
            io.to(globalRoom).emit("chatDispatch", {
               id: socket.id,
               nickname: newUser.nickname,
               system: "disconnect"
            });
         }
      })
   })

   socket.on("chatDispatch", data => {
      io.to(globalRoom).emit("chatDispatch", data);
   });
}
