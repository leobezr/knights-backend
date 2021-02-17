import mongoose from "mongoose";
import KnightClassController from "../controllers/knightClassController.js";
import monsterLooter from "../controllers/monsterLooter.js";
import bossLevelTable from "../../lib/bossLevelTable.js";

const HUNT_API = "/api/v1/hunt/";

export default function (app) {
   /**
    * @method POST
    * Receive reward after each hunt level
    */
   app.post(HUNT_API + "reward", async (req, res) => {
      await mongoose.connect(process.env.MONGO_SERVER, { useNewUrlParser:true, useUnifiedTopology: true});

      const reward = await monsterLooter(req.body);

      try {
         const char = await KnightClassController.receiveHuntReward(req, reward);

         res.status(200).json(char);
      } catch (err) {
         res.status(500).json({ detail: err.message });
      }
   })

   /**
    * @method POST
    */
   app.post(HUNT_API + "reward/boss", async (req, res) => {
      await mongoose.connect(process.env.MONGO_SERVER, { useNewUrlParser:true, useUnifiedTopology: true});

      const reward = await monsterLooter(req.body.enemies);
      const levelUnlocked = bossLevelTable(req.body.level);

      try {
         const char = await KnightClassController.unlockLevel(req, reward, levelUnlocked)

         res.status(200).json(char);
      } catch (err) {
         res.status(500).json({ detail: err.message });
      }
   })
}
