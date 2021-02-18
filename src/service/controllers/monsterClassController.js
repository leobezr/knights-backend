import mongoose from "mongoose";
import CreatureModel from "../../model/creatureModel.js";
import CreatureLevelModel from "../../model/creatureLevelModel.js"
import BossLevelModel from "../../model/bossLevelModel.js"
import uniqid from "uniqid";

export default class {
   static _setRandomId(list) {
      return list.map(element => {
         element.id = uniqid()
         return element;
      })
   }
   static async _dropMonsterCollection() {
      const collections = await mongoose.connection.db
         .listCollections({ name: CreatureModel.collection.name })
         .toArray();

      if (collections.length) {
         return await CreatureModel.collection.drop();
      }
      return;
   }
   static async _dropHuntCollection() {
      const collections = await mongoose.connection.db
         .listCollections({ name: CreatureLevelModel.collection.name })
         .toArray();

      if (collections.length) {
         return await CreatureLevelModel.collection.drop();
      }
      return;
   }
   static async _dropBossCollection() {
      const collections = await mongoose.connection.db
         .listCollections({ name: BossLevelModel.collection.name })
         .toArray();

      if (collections.length) {
         return await BossLevelModel.collection.drop();
      }
      return;
   }
   static async updateMonsters(creatureList) {
      try {
         await this._dropMonsterCollection();
         creatureList = this._setRandomId(creatureList);

         const creatureCollection = new CreatureModel();
         await creatureCollection.collection.insertMany(creatureList);
         await creatureCollection.save();
      } catch (err) {
         throw Error(err);
      }
   }
   static async updateHunts(huntLevels) {
      try {
         await this._dropHuntCollection();

         const creatureCollection = new CreatureLevelModel(huntLevels);
         await creatureCollection.save();
      } catch (err) {
         throw Error(err);
      }
   }
   static async updateBoss(huntLevels) {
      try {
         await this._dropBossCollection();

         const creatureCollection = new BossLevelModel(huntLevels);
         await creatureCollection.save();
      } catch (err) {
         throw Error(err);
      }
   }
   static async getMonsterList() {
      try {
         return await CreatureModel.find({});
      } catch (err) {
         throw Error(err);
      }
   }
}
