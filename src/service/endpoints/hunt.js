import mongo from "mongodb";
import assert from "assert";
import { gearHandler } from "../../repositories/UserRepositories.js";
import monsterLooter from "../controllers/monsterLooter.js";

import * as yup from "yup";

const yupSchema = yup.default.object().shape({
   body: yup.default.object().required()
})

export default function (app) {
   app.post("/api/v1/hunt/reward", async (req, res) => {
      try {
         const DB = process.env.MONGO_SERVER;
         const DB_NAME = process.env.MONGO_DB_NAME;
         const reward = await monsterLooter(req.body.id);
         var knightUser = null;

         if (yupSchema.validate(req)) {
            mongo.connect(DB, (err, client) => {
               assert.strictEqual(err, null);

               const db = client.db(DB_NAME);
               const cursor = db.collection("knights").find({ id: req.header("Requester") });

               cursor.forEach((doc) => {
                  knightUser = gearHandler(doc);
                  knightUser.receiveReward(reward);

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
            })
         }
      } catch (err) {
         throw Error(err);
      }
   })
}