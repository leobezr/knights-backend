import KnightEditor from "../../lib/knightEditor.js";
import CharacterSchema from "../../model/characterModel.js"

export default class {
   static async _promiseUpdateKnight(req, incomingData) {
      return new Promise(async (resolve, reject) => {
         await CharacterSchema.findOneAndUpdate(
            { token: req.header ? req.header("CharAuth") : req },
            incomingData,
            { upsert: true, new: true, useFindAndModify: false },
            function (err, result) {
               if (result) resolve(result);
               if (err) reject(err);
            }
         )
      })
   }
   static async generateArenaId(req) {
      try {
         const character = await CharacterSchema.findOne({ token: req.header("CharAuth") });

         if (character?.token) {
            const charData = new KnightEditor(character.toObject())
               .createBattleSession()
               .config

            return await this._promiseUpdateKnight(req, charData);
         }
         return null;
      } catch (err) {
         throw Error(err);
      }
   }
   static async joinParty(req, id) {
      id = id || null;

      try {
         const character = await CharacterSchema.findOne({ token: req.header("CharAuth") });

         if (character?.token) {
            id = id || character.battleSession.party || null;

            const charData = new KnightEditor(character.toObject())
               .joinParty(id)
               .config

            return await this._promiseUpdateKnight(req, charData);
         }
         return null;
      } catch (err) {
         throw Error(err);
      }
   }
   static async removeParty(req, rooms) {
      try {
         const character = await CharacterSchema.findOne({ token: req.header("CharAuth") });

         if (character?.toObject) {
            const charData = character.toObject();

            let requesterIsLeader = false;
            let playerBeingRemoved = req.body.id;
            let partyRoom = null;

            for (let room in rooms) {
               room = rooms[room];

               if (room.name == "room_" + charData.battleSession.party) {
                  partyRoom = room;
               }
            }

            let leaderIndex = partyRoom.members.findIndex(member => member.leader);
            if (partyRoom.members[leaderIndex].identifier == charData.characterId) {
               requesterIsLeader = true;
            }

            if (playerBeingRemoved != charData.characterId) {
               if (requesterIsLeader) {
                  // REMOVED FROM PARTY
                  let targetPlayer = await CharacterSchema.findOne({ characterId: playerBeingRemoved });

                  if (targetPlayer?.toObject) {
                     const targetPlayerData = new KnightEditor(targetPlayer.toObject())
                        .removeParty()
                        .config

                     return await this._promiseUpdateKnight(targetPlayerData.token, targetPlayerData);
                  }
               }
            } else {
               // REMOVE SELF FROM PARTY
               const knightEditor = new KnightEditor(charData)
                  .removeParty()
                  .config

               return await this._promiseUpdateKnight(req, knightEditor);
            }
         }
         return null;
      } catch (err) {
         throw Error(err);
      }
   }
}
