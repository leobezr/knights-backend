import ArenaController from "../controllers/arenaController.js";
import db from "../db.js";

export default async function (app, io) {
   const PVE_API = "/api/v1/hunt/";
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
    * Constant for storing battleSession data
    * It serves as a getter for the client side, it doesn't manage socket rooms
    */
   const battleSessions = [];

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
                     level: character.level,
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
               level: character.level,
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
            rooms[index].members[existingDataIndex].level = character.level;
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
    * Players will send a request to this endpoint as soon as they land into HuntingGround route
    * Counts how many players in a party are joining the game so the game knows when everyone is loading
    *
    * Spectator mode is allowed
    *
    * battleData is a request param from the client side
    * divided as `${partyRoom};${sessionId};${monsterId}`
    *
    * @param {String} partyRoom -> Party room name
    * @param {String} sessionId -> Random battle session ID
    * @param {String} monsterId -> Monster ID
    *
    * @returns {Object} creatureData
    */
   app.post(PVE_API + "startBattle", async (req, res) => {
      await db();
      const battleData = req?.body?.session;

      if (!battleData) {
         res.status(400).json({ detail: "No session" });
      } else if (battleData.split(";").length != 3) {
         res.status(401).json({ detail: "Incorrect code" });
      }

      try {
         const characterData = await ArenaController.getPlayer(req);
         const code = battleData.split(";");

         let codeData = {
            party: code[0],
            battleId: code[1],
            monsterId: code[2]
         }

         const creatureProps = await ArenaController.getMonsters(codeData.monsterId);

         if (characterData.battleSession.id == battleData) {
            let index = battleSessions.findIndex(battle => battle.id == battleData);

            if (index == -1) { // Requester generates a battle session
               let memberReady = {};
               memberReady[characterData.nickname] = false;

               battleSessions.push({
                  id: battleData,
                  party: codeData.party,
                  spectating: [],
                  membersReady: memberReady,
                  enemies: [creatureProps]
               })

            } else { // If battle session exists
               let memberIndex = battleSessions[index].membersReady[characterData.nickname] ?? null;

               if (memberIndex == null) {
                  battleSessions[index].membersReady[characterData.nickname] = false;
               }
            }
         } else {
            let index = battleSessions.findIndex(battle => battle.id == battleData);

            if (index == -1) {
               res.status(401).json({ detail: "No active battles" });
               return;
            } else {
               battleSessions[index].spectating.push(characterData.nickname);
            }
         }
         res.status(200).json(creatureProps);
      } catch (err) {
         res.status(500).json({ detail: err });
      }

   })
   /**
    * PVE API
    * Player generates battleSession.id based on the monster id
    * This is for Hunt
    *
    * Every party member receives a battle id
    */
   app.post(PVE_API + "battle/", async (req, res) => {
      await db();
      try {
         const battleSession = await ArenaController.generateArenaId(req, getPartyMembers);

         if (battleSession) {
            res.status(201).json(battleSession.id);
            io.of("/").in(battleSession.room).emit("sendPartyMembers", {
               name: "HuntingGround",
               params: { hunt: battleSession.id }
            });
            return;
         }

         res.status(400).json({ detail: "Battle wasn't started" });
      } catch (err) {
         throw res.status(err.status || 500).json({ detail: err.detail || err.message })
      }
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
       * Party invitation
       * Emits event to the invited player
       */
      socket.on("battleGenerated", props => {
         if (!rooms.length) return;

         const partyRoom = getPartyMembers(props.battleSession.party);

         io.of("/").to(partyRoom.name).emit("battleGenerated", props.nickname);
      })

      /**
       * Client side alert images ready
       * Every client that completes an image loading emits an event
       *
       * For every loading client, a percentage is sent
       * If all clients load, all clients get the OK alert
       */
      socket.on("clientReady", async props => {
         if (!battleSessions.length) return;

         const session = props.battleSession.id;
         var battleIndex = battleSessions.findIndex(battle => battle.id == session);
         var canStart = false;

         var clientsReady = 0;
         var totalMembers = 1;

         if (battleIndex != -1) { // If battle exists
            let members = battleSessions[battleIndex].membersReady;
            totalMembers = Object.keys(members).length;

            battleSessions[battleIndex].membersReady[props.nickname] = true;

            await socket.join(battleSessions[battleIndex].id);

            for (let client in members) {
               client = members[client];
               canStart = true;
               clientsReady++

               if (!client) {
                  canStart = false;
                  break;
               }
            }
         }
         if (canStart) { // Tells the client that it should start the battle
            io.of("/")
               .in(battleSessions[battleIndex].id)
               .emit("clientBattleReady");
         } else { // Sends the percentage of other clients state
            io.of("/")
               .in(battleSessions[battleIndex].id)
               .emit("clientBattlePercent", clientsReady / totalMembers * 100);
         }
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
