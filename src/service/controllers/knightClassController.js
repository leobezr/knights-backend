import mongoose from "mongoose"
import { characterFactory, gearHandler } from "../../repositories/UserRepositories.js";
import CharacterSchema, { RawCharacterSchema } from "../../model/characterModel.js"
import { userSchema } from "../../model/userModel.js";

const UserModel = mongoose.model("users", userSchema);
const CharacterModel = mongoose.model("knights", RawCharacterSchema);

export default class {
   static async _promiseUpdateKnight(req, incomingData) {
      return new Promise(async (resolve, reject) => {
         await CharacterModel.findOneAndUpdate(
            { token: req.header("CharAuth") },
            incomingData,
            { upsert: true, new: true },
            function (err, result) {
               if (result) resolve(result);
               if (err) reject(err);
            }
         )
      })
   }

   static async addKnight(req) {
      try {
         const charFactory = await characterFactory(req);

         const char = new CharacterSchema({ ...charFactory })
         await char.save();

         await UserModel.findOneAndUpdate(
            { token: req.header("Authorization") },
            { $push: { characters: character } }
         );

         return true;
      } catch (err) {
         throw Error(err);
      }
   }
   static async addAttr(req) {
      try {
         const char = await CharacterModel.findOne({ token: req.header("CharAuth") });

         let attributes = gearHandler(char._doc)
            .addAttrStatus(req.body.attr)
            .config.attributes;

         char.attributes = attributes;
         char.save();

         return char;
      } catch (err) {
         throw Error(err);
      }
   }
   static async equip(req) {
      try {
         const Char = await CharacterModel.findOne({ token: req.header("CharAuth") });
         const CharModel = Char.toObject();

         let knightData = gearHandler(CharModel)
            .equip(req.body.equip)
            .config;

         return await this._promiseUpdateKnight(req, knightData);
      } catch (err) {
         throw Error(err);
      }
   }
   static async getData(req) {
      try {
         const Char = await CharacterModel.findOne({ token: req.header("CharAuth") });
         return Char.toObject();
      } catch (err) {
         throw Error(err);
      }
   }
   static async unequip(req) {
      try {
         const Char = await CharacterModel.findOne({ token: req.header("CharAuth") });
         const CharModel = Char.toObject();

         let knightData = gearHandler(CharModel)
            .unequip(req.body.slot)
            .config;

         return await this._promiseUpdateKnight(req, knightData);
      } catch (err) {
         throw Error(err);
      }
   }
   static async receiveReward(req) {
      try {
         const Char = await CharacterModel.findOne({ token: req.header("CharAuth") });
         const CharModel = Char.toObject();

         let knightData = gearHandler(CharModel)
            .getRewards()
            .config;

         return await this._promiseUpdateKnight(req, knightData);
      } catch (err) {
         throw Error(err);
      }
   }
   static async receiveHuntReward(req, reward) {
      try {
         const Char = await CharacterModel.findOne({ token: req.header("CharAuth") });
         const CharModel = Char.toObject();

         let knightData = gearHandler(CharModel)
            .receiveReward(reward.items, reward.gold)
            .receiveExp(reward.exp);

         return await this._promiseUpdateKnight(req, knightData.config);
      } catch (err) {
         throw Error(err);
      }
   }
   static async unlockLevel(req, reward, level) {
      try {
         const Char = await CharacterModel.findOne({ token: req.header("CharAuth") });
         const CharModel = Char.toObject();

         await this.receiveHuntReward(req, reward);
         let knightData = gearHandler(CharModel).unlockLevel(level);

         return await this._promiseUpdateKnight(req, knightData.config);
      } catch (err) {
         throw Error(err);
      }
   }
   static async sellItem(req) {
      try {
         const Char = await CharacterModel.findOne({ token: req.header("CharAuth") });
         const CharModel = Char.toObject();

         let knightData = gearHandler(CharModel)
            .sellItem(req.body.item)
            .config;

         return await this._promiseUpdateKnight(req, knightData);
      } catch (err) {
         throw Error(err);
      }
   }
   static async buyItem(req) {
      try {
         const Char = await CharacterModel.findOne({ token: req.header("CharAuth") });
         const CharModel = Char.toObject();

         let knightData = gearHandler(CharModel)
            .buyItem(req.body.item)
            .config;

         return await this._promiseUpdateKnight(req, knightData);
      } catch (err) {
         throw Error(err);
      }
   }
   static async sellInventoryItems(req) {
      try {
         const Char = await CharacterModel.findOne({ token: req.header("CharAuth") });
         const CharModel = Char.toObject();

         let knightData = gearHandler(CharModel)
            .sellInventoryItems()
            .config;

         return await this._promiseUpdateKnight(req, knightData);
      } catch (err) {
         throw Error(err);
      }
   }
}
