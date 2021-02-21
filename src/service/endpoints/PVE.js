import ArenaController from "../controllers/arenaController.js";
import db from "../db.js";

export default async function (app, io) {
   const PVE_API = "/api/v1/battle/monster/";
   const PARTY_API = "/api/v1/party/"

   /**
    * Serves as a getter for party room
    * @returns {Object} -> { name: String: roomName, members: Array }
    * @param {String} roomName
    */
   function getPartyMembers(roomName) {
      let index = findNameIndex(rooms, roomName);
      if (index != -1) {
         return rooms[index];
      }
   };

   /**
    * Constant for storing room data
    * It serves as a getter for the client side, it doesn't manage socket rooms
    */
   const rooms = [];

   /**
    * Clean rooms with no members from constant rooms
    */
   function cleanEmptyRooms() {
      for (let room in rooms) {
         if (!rooms[room].members.length) {
            rooms.splice(room, 1);
         }
      }
   }
   /**
    * Utils for finding index of rooms by name
    * @param {Array} arr
    * @param {String} compare
    */
   const findNameIndex = (arr, compare) => {
      return arr.findIndex(element => element.name == "room_" + compare);
   }

   /**
    * This function can create or assign a party to a player
    * Depending on his battleSession.party ID, it will create or join an existent party
    * @param {Socket} socket
    * @param {Object} character
    * @param {String} room
    */
   async function joinUser(socket, character, room) {
      await socket.join("room_" + room);

      let index = findNameIndex(rooms, room);

      if (index == -1) { // Creating Party
         let playerInParty = findNameIndex(rooms, character.battleSession.party);

         if (playerInParty == -1) { // Isn't from an existing party
            const newRoomData = {
               name: "room_" + room,
               members: [
                  {
                     id: socket.id,
                     nickname: character.nickname,
                     identifier: character.characterId,
                     online: true,
                     leader: character.characterId == room
                  }
               ]
            }

            rooms.push(newRoomData);
            index = findNameIndex(rooms, room);
         } else { // Is from existing party
            index = playerInParty;
         }
      } else { // Joining Party
         let existingDataIndex = rooms[index].members.findIndex(existingRoom => existingRoom.identifier == character.characterId);

         if (existingDataIndex == -1) { // Isn't in member list
            rooms[index].members.push({
               id: socket.id,
               nickname: character.nickname,
               identifier: character.characterId,
               online: true,
               leader: character.characterId == room
            })

            let oldRoomIndex = findNameIndex(rooms, character.characterId);

            if (oldRoomIndex != -1) {
               rooms.splice(oldRoomIndex, 1);
            }
         } else {
            rooms[index].members[existingDataIndex].online = true;
            rooms[index].members[existingDataIndex].id = socket.id;
         }
      }
      cleanEmptyRooms();

      return rooms[index];
   };
   /**
    * Removes user from rooms
    * rooms is a constant controller that serves as a getters for socket rooms
    * @param {String} id -> Socket ID
    */
   function removeUserFromRoom(id) {
      let userRemoved = null;

      for (let room in rooms) {
         room = rooms[room];

         let index = room.members.findIndex(user => user.identifier == id);
         if (index != -1) {
            userRemoved = room.members.splice(index, 1)[0];
         }

         return { userRemoved, room };
      }
   }
   /**
    * Setter function to change player status in party
    * @param {String} id -> Socket ID
    * @param {Boolean} state -> Online status
    */
   function userSetOnlineState(id, state) {
      for (let room in rooms) {
         room = rooms[room];

         let index = room.members.findIndex(user => user.id == id);
         if (index != -1) {
            room.members[index].online = state
         }

         io.to(room.name).emit("partyMembers", room);
         return room;
      }
   }

   /**
    * PVE API
    * @NotImplemented
    * Generates a battleSession.id
    * After ID is generated, client should emit a PushPlayersToBattle event.
    */
   app.post(PVE_API, async (req, res) => {
      await db();
      const characterData = await ArenaController.generateArenaId(req);

      res.status(200).json(characterData.toObject());
   })
   /**
    * PVE API
    * @NotImplemented
    * Player generates battleSession.id based on the monster id
    * This is for HuntingGrounds
    */
   app.get(PVE_API + ":level", async (req, res) => {
      await db();

   })
   /**
    * Create Party
    * Every time the player logs in he sends a request to create a party
    * If the user has a party ID he is assigned to an existent party
    */
   app.post(PARTY_API + "create/", async (req, res) => {
      await db();
      const characterData = await ArenaController.joinParty(req);

      if (!characterData) {
         res.status(404).json({ detail: "Player not found" });
         return;
      }

      res.status(200).json(characterData.toObject());
   })
   /**
    * Remove from Party
    * A party leader can remove a player from his party
    * Alternative case: A player can remove himself from a party
    */
   app.delete(PARTY_API + "remove/", async (req, res) => {
      await db();
      try {
         const characterData = await ArenaController.removeParty(req, rooms);

         if (!characterData.toObject) {
            res.status(400).json({ detail: "No permission" })
            return;
         }

         res.status(200).json(characterData)

         // Notify members of party update
         const removed = removeUserFromRoom(req.body.id);
         io.to(removed.room.name).emit("partyRemoved", removed);
      } catch (err) {
         res.status(500).json({ detail: err });
         throw Error(err);
      }
   })
   /**
    * Player joins a party
    */
   app.post(PARTY_API + "join/", async (req, res) => {
      await db();
      const characterData = await ArenaController.joinParty(req, req.body.id)

      if (!characterData) {
         res.status(404).json({ detail: "Player not found" });
         return;
      }

      res.status(200).json(characterData.toObject());
   })

   /**
    * On connection callback
    */
   io.on("connection", socket => {
      socket.on("joinParty", async characterData => {
         const roomName = characterData.battleSession.party || characterData.characterId;

         if (!roomName) return;

         const partyMembers = await joinUser(socket, characterData, roomName);

         io.to("room_" + roomName).emit("partyMembers", partyMembers);
      })

      /**
       * @returns partyGroup
       */
      socket.on("partyMembers", async (data) => {
         const characterData = data;
         const roomName = characterData.battleSession.party;
         const partyGroup = await getPartyMembers(roomName);

         io.to(partyGroup.name).emit("partyMembers", partyGroup);
      })

      /**
       * Party invitation
       * Emits event to the invited player
       */
      socket.on("partyInvite", async props => {
         for (let room in rooms) {
            room = rooms[room];

            let index = room.members.findIndex(user => user.nickname == props.invited);
            if (index != -1) {
               io.to(room.members[index].id).emit("partyInvite", props.inviter);
               break;
            }
         }
      })

      /**
       * Leaves current room to join another room with characterId
       * Can't be the party leader
       */
      socket.on("partyRemoved", async ({ member, persona }) => {
         persona.battleSession.party = null;

         socket.leave(member.room.name);

         const room = await joinUser(socket, persona, member.userRemoved.identifier);

         socket.to("room_" + room).emit("partyUpdated", room);
      })

      /**
       * Manage online state
       * And updates socket id in party room
       */
      socket.on("disconnect", () => {
         userSetOnlineState(socket.id, false)
      })

      socket.on("forceDisconnect", () => {
         userSetOnlineState(socket.id, false)
      })
   })
}
