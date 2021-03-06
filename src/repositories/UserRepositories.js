import KnightFactory from "../lib/knightFactory.js";
import KnightEditor from "../lib/knightEditor.js";
import noviceItemGenerator from "../lib/noviceItemGenerator.js";
import { getItemList } from "../service/controllers/itemController.js";


/**
 * Public functions
 */
export async function characterFactory(req) {
   let itemList = await getItemList();

   const NOVICE_SET = noviceItemGenerator(itemList);

   let knight = new KnightFactory(req.body);
   knight.equip(NOVICE_SET);

   knight.giveItem(itemList.weapons[0]);
   knight.giveItem(itemList.weapons[1]);
   knight.giveItem(itemList.footgear[0]);

   return knight;
}

export function gearHandler(character) {
   return new KnightEditor(character);
}
