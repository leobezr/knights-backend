import uniqid from "uniqid"

const Modifier = () => {
   return {
      armor: 0,
      luk: 0,
      str: 0,
      agi: 0,
      vit: 0,

      hit: 0,
      atk: 0,
   };
}

export default class Knight {
   constructor(options) {
      this.id = uniqid(this.resolveName(options.name) + "-");
      this.name = this.resolveName(options.name);
      this.nickname = options.name || null;
      this.sprite = options.sprite || 0;
      this.gender = options.gender || "female";

      this.experience = 0;
      this.level = 1;
      this.job = "Knight";
      this.vocation = "Squire";

      this.lastBattles = [];

      this.cooldown = {
         train: Date.now(),
         hunt: Date.now(),
         brew: Date.now(),
      }

      this.honor = 0;

      this.events = {
         dungeon: Date.now(),
      }

      this.equipped = {
         "headgear-top": null,
         "headgear-middle": null,
         "headgear-lower": null,
         armor: null,
         footgear: null,
         shield: null,
         weapon: null,
         accessory_1: null,
         accessory_2: null,
         accessory_3: null,
         accessory_4: null,
      };
      this.reward = [];

      this.modifier = { ...Modifier() };

      this.inventory = [];

      this.gold = 200;

      this.attributes = {
         cp: 0,
         hit: 10,
         str: 10,
         vit: 10,
         agi: 10,
         luk: 10,
         atk: 10,
         def: 10,
         hp: {
            value: 10,
            total: 10
         }
      }
   }
   _applyMod() {
      let itemsEquipped = {};
      let attr = { ...Modifier() };

      for (let equipped in this.equipped) {
         if (this.equipped[equipped]) {
            itemsEquipped[equipped] = this.equipped[equipped]
         }
      }

      for (let item in itemsEquipped) {
         for (let mod in itemsEquipped[item].attr) {
            attr[mod] += itemsEquipped[item].attr[mod];
         }
      }

      this.modifier = { ...attr };
      this._calculateCP();
   }
   _calculateCP() {
      let { cp, ...attr } = this.attributes;
      let mods = { ...this.modifier };

      let values = { ...attr, ...mods }
      cp = 0;

      for (let value in values) {
         let val = parseFloat(values[value]) || 0;

         cp += val * 10;
      }

      this.attributes.cp = cp + this.level * 100;
   }
   resolveName(name) {
      name = name || "";

      return name.toLowerCase().replace(/ /g, "-")
   }
   giveItem(item) {
      this.inventory.push(item);
      return this;
   }
   equip(itemSet) {
      for (let item in itemSet) {
         this.equipped[item] = itemSet[item];
      }
      this._applyMod();
   }
}