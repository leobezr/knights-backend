import fs from "fs";
import path from "path";
import KnightFactory from "../lib/knightGenerator.js";
import KnightEditor from "../lib/knightEditor.js";
import noviceItemGenerator from "../lib/noviceItemGenerator.js";
import { getItemList } from "../service/controllers/itemController.js";


/**
 * Public functions
 */

export async function getUsers() {
   const DB = fs.readFileSync(path.join(__dirname, "../model/knights.json"));

   let data = JSON.parse(DB);
   return data;
}

export async function addUser(req) {
   let itemList = await getItemList();

   const NOVICE_SET = noviceItemGenerator(itemList);

   let knight = new KnightFactory(req.body);
   knight.equip(NOVICE_SET);
   
   knight.giveItem(itemList.accessories[2]);
   knight.giveItem(itemList.footgear[0]);

   return knight;
}

export function gearHandler(character) {
   return new KnightEditor(character);
}