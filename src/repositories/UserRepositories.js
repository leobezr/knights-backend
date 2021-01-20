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
      const NOVICE_SET = await noviceItemGenerator();

      let knight = new KnightFactory(req.body);
      knight.equip(NOVICE_SET);

      return knight;
   } catch (err) {
      throw Error(err)
   }
}

export function gearHandler(character) {
   return new KnightEditor(character);
}