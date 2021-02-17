import mongoose from "mongoose"
import fs from "fs";
import path from "path";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import MonsterClassController from "../service/controllers/monsterClassController.js";
import ItemClassController from "../service/controllers/itemClassController.js";

/**
 * Fetch items inside JSON file
 * @returns FIle list
 */
async function readJSONFile(pathToFile) {
   try {
      const __dirname = dirname(fileURLToPath(import.meta.url));
      const DB = await fs.readFileSync(path.join(__dirname, pathToFile));

      return JSON.parse(DB);
   } catch (e) {
      throw e
   }
}
/**
 * Drop and update items in DB
 */
async function updateItemDB() {
   const items = await readJSONFile("../model/items/items.json");

   await ItemClassController.updateItems(items);
}
async function updateMonsterDB() {
   const creatures = await readJSONFile("../model/monsters.json");

   await MonsterClassController.updateMonsters(creatures);
}

async function updateDB() {
   await mongoose.connect(process.env.MONGO_SERVER, { useNewUrlParser:true, useUnifiedTopology: true});

   try {
      await updateItemDB();
      await updateMonsterDB();
   } catch (err) {
      throw Error(err);
   }
}

export { updateDB }
