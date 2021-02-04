import mongo from "mongodb";
import assert from "assert";
import { gearHandler } from "../../repositories/UserRepositories.js";
import { getItemList } from "../controllers/itemController.js";
import monsterLooter from "../controllers/monsterLooter.js";

export default function (app) {
   app.post("/api/v1/hunt/reward", async (req, res, next) => {
      try {
         const DB = process.env.MONGO_SERVER;
         const DB_NAME = process.env.MONGO_DB_NAME;
         const reward = await monsterLooter(req.body);
         const itemList = await getItemList();
         var knightUser = null;

         mongo.connect(DB, (err, client) => {
            assert.strictEqual(err, null);

            try {
               const db = client.db(DB_NAME);
               const cursor = db.collection("knights").find({ id: req.header("Requester") });

               cursor.forEach((doc) => {
                  knightUser = gearHandler(doc);

                  let itemSprites = reward.lootbag.map(item => {
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

                  knightUser.receiveReward(itemSprites, reward.gold);
                  knightUser.receiveExp(reward.experience);

                  let { _id, ...knightData } = knightUser.config;

                  db.collection("knights").updateOne({ id: req.header("Requester") }, {
                     $set: { ...knightData }
                  })
               }, () => {
                  client.close();

                  if (knightUser) {
                     res.status(200).json({ user: knightUser.config })
                  } else {
                     res.status(400).json({ detail: "No rewards" })
                  }
               })
            } catch (error) {
               res.status(404).json({ detail: "User not found" });
               next();
            }
         })
      } catch (err) {
         throw Error(err);
      }
   })
}
