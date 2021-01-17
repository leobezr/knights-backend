import fs from "fs";
import path from "path";
import KnightFactory from "../lib/knightGenerator.js";
import noviceItemGenerator from "../lib//noviceItemGenerator.js";

export async function getUsers() {
   try {
      const DB = fs.readFileSync(path.join(__dirname, "../model/knights.json"));

      let data = JSON.parse(DB);
      return data;
   } catch (e) {
      next(e)
   }

}

export async function addUser(req) {
   try {
      const DB = fs.readFileSync(path.join(__dirname, '../model/knights.json'));
      const NOVICE_SET = await noviceItemGenerator()

      let data = JSON.parse(DB);
      let userData = req.body;

      if (!userData) {
         return false
      }

      let newKnightConfig = new KnightFactory(userData);

      newKnightConfig.equipped = {
         headgear_top: null,
         headgear_middle: null,
         headgear_lower: null,
         armor: NOVICE_SET.armor,
         footgear: null,
         shield: NOVICE_SET.shield,
         weapon: NOVICE_SET.weapon,
         accessory_1: NOVICE_SET.accessory,
         accessory_2: null,
         accessory_3: null,
         accessory_4: null,
      };

      data.push(newKnightConfig);

      fs.writeFileSync(path.join(__dirname, '../model/knights.json'), JSON.stringify(data));
      return newKnightConfig;
   } catch (e) {
      throw new Error(e)
   }
}