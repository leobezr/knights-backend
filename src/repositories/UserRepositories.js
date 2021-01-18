import fs from "fs";
import path from "path";
import KnightFactory from "../lib/knightGenerator.js";
import KnightEditor from "../lib/knightEditor.js";
import noviceItemGenerator from "../lib//noviceItemGenerator.js";

export async function getUsers() {
   const DB = fs.readFileSync(path.join(__dirname, "../model/knights.json"));

   let data = JSON.parse(DB);
   return data;
}

export async function addUser(req) {
   try {
      const DB = fs.readFileSync(path.join(__dirname, '../model/knights.json'));
      const NOVICE_SET = await noviceItemGenerator()

      let data = JSON.parse(DB);
      let userData = req.body;

      if (!userData) {
         throw "No user data in Body";
      }

      let knight = new KnightFactory(userData);
      knight.equip(NOVICE_SET);

      data.push(knight);

      fs.writeFileSync(path.join(__dirname, '../model/knights.json'), JSON.stringify(data));
      return knight;
   } catch (err) {
      throw Error(err)
   }
}

export async function gearHandler(characterId, equip, removing) {
   removing = removing || false;

   const CHARACTER_LIST = await getUsers();

   const CHARACTER = CHARACTER_LIST.filter(character => character.id == characterId);

   if (CHARACTER && CHARACTER.length) {
      let knight = new KnightEditor(CHARACTER[0]);

      if (!removing) {
         knight.equip(equip);
      } else {
         knight.unequip(equip);
      }

      CHARACTER_LIST.splice(CHARACTER_LIST.indexOf(CHARACTER, 1));
      CHARACTER_LIST.push(knight.config);

      fs.writeFileSync(path.join(__dirname, '../model/knights.json'), JSON.stringify(CHARACTER_LIST));
      return knight.config;
   } else {
      throw "Character not found";
   }
}