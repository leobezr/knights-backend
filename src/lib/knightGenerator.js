import uniqid from "uniqid"

const Modifier = () => {
   return {
      armor: 0,

      str: 0,
      agi: 0,
      vit: 0,
      dex: 0,
      luk: 0,

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

      this.honor = 250;

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
      this.reward = {
         items: [],
         gold: 0
      };

      this.modifier = { ...Modifier() };
      this.misc = {
         attackRange: 15
      }

      this.inventory = [];

      this.gold = 200;

      this.attributes = {
         cp: 0,
         hit: 10,

         str: 10,
         agi: 10,
         vit: 10,
         dex: 10,
         luk: 10,

         def: 0,

         hp: 100
      }
   }
   _calculateTotalDef() {
      var { vit, agi } = this.attributes;
      let attr = { vit, agi };

      var { vit, agi, armor } = this.modifier;
      let modAttr = { vit, agi, armor };

      const SOFT_DEF = Math.floor(((attr.vit + modAttr.vit) / 2) + ((attr.agi + modAttr.agi) / 3) + (this.level / 2));
      this.attributes.def = Math.round((SOFT_DEF) * (1 + modAttr.armor / 100));
   }
   _calculateHealth() {
      var { vit } = this.attributes;
      let attr = { vit };

      var { vit } = this.modifier;
      let modAttr = { vit };

      var BASE_HP = 100;
      var BASE_LEVEL = this.level;

      BASE_HP += this.level;

      for (var i = 2; i <= BASE_LEVEL; i++) {
         BASE_HP += Math.round((BASE_LEVEL * i) * .1);
      }

      var MAX_HP = BASE_HP;
      var VIT = attr.vit + modAttr.vit;

      var REDUCER_MOD = .01;

      MAX_HP = Math.floor(MAX_HP * (1 + VIT * 0.01) * REDUCER_MOD);
      this.attributes.hp = BASE_HP + MAX_HP;
   }
   _calculateHit() {
      var { str, luk, dex } = this.attributes;
      let attr = { str, luk, dex };

      var { str, luk, dex } = this.modifier;
      let modAttr = { str, luk, dex };

      let totalStr = Math.floor(attr.str + modAttr.str);
      let totalLuk = Math.floor(attr.luk + modAttr.luk);
      let totalDex = Math.floor(attr.dex + modAttr.dex);

      this.attributes.hit = Math.round(Math.floor(
         (this.level / 4) + totalStr + (totalDex / 5) + (totalLuk / 3)
      ));
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
      this._calculateHit();
      this._calculateHealth();
      this._calculateTotalDef();
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
