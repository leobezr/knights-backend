const users = [];

function joinUser(socketId, nickname, room) {
   const user = {
      socketID: socketId,
      nickname,
      room
   }
   users.push(user);
   return user;
}
function removeUser(id) {
   const getId = users => users.socketID == id;
   const index = users.findIndex(getId);

   if (index != -1) return users.splice(index, 1)[0];
}

export { joinUser, users, removeUser };
