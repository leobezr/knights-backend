import KnightEditor from "../../lib/knightEditor.js";
import uniqid from "uniqid";
import CharacterSchema from "../../model/characterModel.js"
import CreatureSchema from "../../model/creatureModel.js"
import partyRules from "../../rules/partyRules.js";

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
   static async generateArenaId(req, getPartyMembers) {
      try {
         const battleInitiator = await CharacterSchema.findOne({ token: req.header("CharAuth") });
         let monster = await CreatureSchema.findOne({ id: req?.body?.monster });

         if (battleInitiator.toObject && monster.toObject) {
            let battleInitiatorObj = battleInitiator.toObject();
            monster = monster.toObject();

            const party = getPartyMembers(battleInitiatorObj.battleSession.party);
            if (!party) throw Error({ status: 401, detail: "Player isn't from a party" });

            const updatePartyMemberBattleId = () => {
               return new Promise(async (resolve, reject) => {
                  var partyMembers = [];
                  var battleId = uniqid(party.name + ";", ";" + monster.id);

                  for (let member in party.members) {
                     member = party.members[member];
                     member = await CharacterSchema.findOne({ characterId: member.identifier });
                     var knight = null

                     if (member.toObject) {
                        member = member.toObject();

                        if (partyRules.canHuntMonster(member.level, monster.level)) {
                           knight = new KnightEditor(member)
                              .createBattleSession(battleId)
                              .config;

                           await this._promiseUpdateKnight(member.token, knight);

                           partyMembers.push(member);
                        }
                     } else {
                        reject(member);
                     }
                  }
                  resolve({
                     id: battleId,
                     room: party.name
                  });
               })
            }

            return await updatePartyMemberBattleId();
         } else {
            let ERROR = "";

            if (!character.toObject) ERROR += "Invalid character token; ";
            if (!monster.toObject) ERROR += "Invalid monster ID; ";

            throw Error({ status: 400, detail: ERROR.trim() });
         }
      } catch (err) {
         throw Error({ status: 500, detail: err.message });
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
   static async getPlayer(req) {
      try {
         const characterData = await CharacterSchema.findOne({ token: req.header("CharAuth") });

         if (characterData.toObject) {
            return new KnightEditor(characterData.toObject()).config;
         }
      } catch (err) {
         throw Error(err);
      }
   }
   static async getMonsters(monsterId) {
      try {
         const monsterList = await CreatureSchema.findOne({ id: monsterId });

         if (monsterList.toObject) {
            return monsterList.toObject();
         }
         return null;
      } catch (err) {
         throw Error(err);
      }
   }
}
