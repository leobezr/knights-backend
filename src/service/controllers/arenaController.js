import KnightEditor from "../../lib/knightEditor.js";
import CharacterSchema from "../../model/characterModel.js"

export default class {
   static async _promiseUpdateKnight(req, incomingData) {
      return new Promise(async (resolve, reject) => {
         await CharacterSchema.findOneAndUpdate(
            { token: req.header("CharAuth") },
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
}
