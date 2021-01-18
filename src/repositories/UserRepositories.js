import fs from "fs";
import path from "path";
import KnightFactory from "../lib/knightGenerator.js";
import KnightEditor from "../lib/knightEditor.js";
import noviceItemGenerator from "../lib//noviceItemGenerator.js";

/**
 * Private functions
 */
function _removeItem(list, item) {
   item = JSON.stringify(item);
   let itemIndex = null;

   for (let $index in list) {
      let listItem = JSON.stringify(list[$index]);

      if (listItem == item) {
         itemIndex = $index;
         break;
      }
   }

   if (itemIndex) {
      list.splice(itemIndex, 1);
   }
   return list;
}

/**
 * Public functions
 */

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

   let knightList = await getUsers();

   let character = knightList.filter(character => character.id == characterId);

   if (character && character.length) {
      let knight = new KnightEditor(character[0]);

      if (!removing) {
         knight.equip(equip);
      } else {
         knight.unequip(equip);
      }

      knightList = _removeItem(knightList, character[0]);
      knightList.push(knight.config);

      fs.writeFileSync(path.join(__dirname, '../model/knights.json'), JSON.stringify(knightList));
      return knight.config;
   } else {
      throw "Character not found";
   }
}