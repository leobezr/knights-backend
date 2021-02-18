import mongoose from "mongoose";
import ArenaController from "../controllers/arenaController.js";

const PVE_API = "/api/v1/battle/monster/";

export default async function (app, socket, io) {
   await mongoose.connect(process.env.MONGO_SERVER);

   const rooms = [];

   app.post(PVE_API, async (req, res) => {
      const characterData = await ArenaController.generateArenaId(req);
      res.status(200).json(characterData.toObject());

      // socket.emit("joinMonsterBattle", characterData.)
   })
   app.get(PVE_API + ":level", async (req, res) => {

   })
}
