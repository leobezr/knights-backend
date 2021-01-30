import mongo from "mongodb";
import assert from "assert";

import * as yup from "yup";

const yupSchema = yup.default.number().required().positive().integer()

async function getMonsterData(monsterId) {
   const DB_SERVER = process.env.MONGO_SERVER;
   const DB_NAME = process.env.MONGO_DB_NAME;

   var monster = null;

   return new Promise((resolve, reject) => {
      try {
         if (yupSchema.validate(monsterId)) {
            mongo.connect(DB_SERVER).then((client) => {
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
                     reject("User not found");
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

export default async function (monsterId) {
   let drop = await getMonsterData(monsterId);

   const rng = () => Math.random() * 100;
   const goldRng = () => Math.floor(Math.random() * (drop.gold.max - drop.gold.min) + drop.gold.min);

   let lootbag = drop.loot.filter(item => item.chance >= rng());
   let gold = goldRng();
   let experience = drop.experience;

   return {
      lootbag,
      gold,
      experience
   }
}
