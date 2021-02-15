import mongoose from "mongoose"
import CreatureModel from "../../model/creatureModel.js";

export default class {
   static async _dropMonsterCollection() {
      if (mongoose.connection.db) {
         return await mongoose.connection.db.dropCollection("monsters");
      }
      return;
   }
   static async updateMonsters(creatureList) {
      try {
         await this._dropMonsterCollection();

         const creatureCollection = new CreatureModel();
         await creatureCollection.collection.insertMany(creatureList);
         await creatureCollection.save();
      } catch (err) {
         throw Error(err);
      }
   }
}
