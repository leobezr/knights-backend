import mongo from "mongodb";
import assert from "assert";
import { getItemList } from "../controllers/itemController.js";

import * as yup from "yup";

const yupSchema = yup.default.number().required().positive().integer()

async function getMonsterData(monsterId) {
   const DB_SERVER = process.env.MONGO_SERVER;
   const DB_NAME = process.env.MONGO_DB_NAME;

   var monster = null;

   return new Promise((resolve, reject) => {
      try {
         if (yupSchema.validate(monsterId)) {
            mongo.connect(DB_SERVER, { useNewUrlParser:true, useUnifiedTopology: true}).then((client) => {
               const db = client.db(DB_NAME);
               const cursor = db.collection("monsters").find({ id: monsterId });

               cursor.forEach((doc, err) => {
                  assert.strictEqual(err, undefined);

                  monster = doc;
               }, () => {
                  client.close();

                  if (monster) {
                     resolve(monster);
                  } else {
                     reject("Monster not found with the provided ID");
                  }
               })
            })
         } else {
            throw "Body is required"
         }
      } catch (err) {
         throw Error(err);
      }
   })
}

export default async function (reward) {
   let lootbag = [];
   let gold = 0;
   let experience = 0;

   const rng = () => Math.random() * 100;
   const goldRng = (drop) => Math.floor(Math.random() * (drop.gold.max - drop.gold.min) + drop.gold.min);

   for (let monsterId in reward) {
      let drop = await getMonsterData(Number(monsterId));

      for (let count = 0; count < reward[monsterId]; count++) {
         lootbag = [...lootbag, ...drop.loot.filter(item => item.chance >= rng())];
         gold += goldRng(drop);
         experience += drop.experience;
      }
   }

   const itemList = await getItemList();
   let items = lootbag.map(item => {
      let filteredItem = null;

      for (let scopeItem in itemList) {
         if (Array.isArray(itemList[scopeItem])) {
            filteredItem = itemList[scopeItem].filter(key => key.id == item.id);
            if (filteredItem.length) {
               filteredItem = filteredItem[0];
               break;
            };
         }
      }
      return filteredItem;
   })

   return {
      lootbag,
      items,
      gold,
      exp: experience
   }
}
