import { buyItem, sellItem } from "./market.js";

const GAIN_STATUS_PER_LEVEL = 5;
const MAX_STATUS_POINTS = 200;

/**
 * Modifier boilerplate
 * @returns {Object}
 */
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

const _compare = (item1, item2) => {
   return JSON.stringify(item1) == JSON.stringify(item2);
}
const _removeItem = (list, item) => {
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

export default class {
   constructor(knight) {
      this.config = { ...knight };
   }
   _calculateLevel() {
      let a = (exp) => Math.cbrt(
         Math.sqrt(3) * Math.sqrt((243 * Math.pow(exp, 2)) - (48600 * exp) + 3680000) + (27 * exp) - 2700
      );

      let exp = this.config.experience;
      let result = ((a(exp) / Math.pow(30, 2 / 3)) - ((5 * Math.pow(10, 2 / 3)) / Math.cbrt(3) / a(exp))) + 2;

      this.config.level = Math.round(result);
   }
   _calculateTotalDef() {
      var { vit, agi } = this.config.attributes;
      let attr = { vit, agi };

      var { vit, agi, armor } = this.config.modifier;
      let modAttr = { vit, agi, armor };

      const SOFT_DEF = Math.floor(((attr.vit + modAttr.vit) / 2) + ((attr.agi + modAttr.agi) / 3) + (this.config.level / 2));
      this.config.attributes.def = Math.round((SOFT_DEF) * (1 + modAttr.armor / 10));
   }
   /**
    * Max health calculation
    */
   _calculateHealth() {
      var { vit } = this.config.attributes;
      let attr = { vit };

      var { vit } = this.config.modifier;
      let modAttr = { vit };

      var BASE_HP = 100;
      var BASE_LEVEL = this.config.level;

      BASE_HP += this.config.level;

      for (var i = 2; i <= BASE_LEVEL; i++) {
         BASE_HP += Math.round((BASE_LEVEL * i) * .1);
      }

      var MAX_HP = BASE_HP;
      var VIT = attr.vit + modAttr.vit;

      var REDUCER_MOD = .01;

      MAX_HP = Math.floor(MAX_HP * (1 + VIT * 0.01) * REDUCER_MOD);
      this.config.attributes.hp = BASE_HP + MAX_HP;
   }
   /**
    * Character power calculation
    */
   _calculateCP() {
      let { cp, ...attr } = this.config.attributes;
      let mods = { ...this.config.modifier };

      cp = 0;

      for (let value in attr) {
         let val = parseFloat(attr[value]) || 0;

         cp += val * 10;
      }
      for (let value in mods) {
         let val = parseFloat(mods[value]) || 0;

         cp += val * 10;
      }

      this.config.attributes.cp = cp + this.config.level * 100;
   }
   /**
    * Calculates total stats added
    */
   _calculateAttrPoints() {
      let { str, agi, vit, luk, dex } = this.config.attributes;
      let attr = { str, agi, vit, luk, dex };

      let statusPoints = -50;

      for (let value in attr) {
         let val = parseFloat(attr[value]) || 0;

         statusPoints += val;
      }
      return statusPoints;
   }
   /**
    * Calculate hit based on stats and mods
    */
   _calculateHit() {
      var { str, luk, dex } = this.config.attributes;
      let attr = { str, luk, dex };

      var { str, luk, dex } = this.config.modifier;
      let modAttr = { str, luk, dex };

      let totalStr = Math.floor(attr.str + modAttr.str);
      let totalLuk = Math.floor(attr.luk + modAttr.luk);
      let totalDex = Math.floor(attr.dex + modAttr.dex);

      this.config.attributes.hit = Math.round(Math.floor(
         (this.config.level / 4) + totalStr + (totalDex / 5) + (totalLuk / 3)
      ));
   }
   /**
    * Apply all mods and calculate final scores
    */
   _applyMod() {
      let itemsEquipped = {};
      let attr = { ...Modifier() };

      for (let equipped in this.config.equipped) {
         if (this.config.equipped[equipped]) {
            itemsEquipped[equipped] = this.config.equipped[equipped]
         }
      }

      for (let item in itemsEquipped) {
         for (let mod in itemsEquipped[item].attr) {
            attr[mod] += itemsEquipped[item].attr[mod];
         }
      }

      this.config.modifier = { ...attr };

      this._calculateCP();
      this._calculateHit();
      this._calculateHealth();
      this._calculateTotalDef();
   }
   /**
    * Adds status to attr
    * @param {Object} status
    */
   addAttrStatus(status) {
      let attrPoints = this._calculateAttrPoints();
      let hasPoints = Math.round(Math.abs(attrPoints - (this.config.level * GAIN_STATUS_PER_LEVEL)))

      let statusName = this.config.attributes[status]

      if (Boolean(hasPoints && statusName < MAX_STATUS_POINTS)) {
         this.config.attributes[status] += 1;
      }
      this._applyMod();
      return this;
   }
   /**
    * Finds item inside knight config
    * @param {Object} item
    * @returns {Object}
    */
   findItem(item) {
      const INVENTORY = this.config.inventory;

      return INVENTORY.filter(search => _compare(item, search))[0];
   }
   /**
    * Un-equips item
    * @param {Object} item
    * @param {String} slot
    * @returns {Object}
    */
   unequip(item, slot) {
      this.config.equipped[slot] = null;
      this.sendToInventory(item);

      this._applyMod();
      return this;
   }
   /**
    * Equips item
    * @param {Object} item
    * @returns {Object}
    */
   equip(item) {
      const EQUIPPED = { ...this.config.equipped };
      var equipRemovedFromSlot = null;

      this.removeFromInventory(item);

      if (item.type == "accessories") {
         let equippedEmptySlot = false;

         for (let i = 1; i < 5; i++) {
            if (!EQUIPPED[`accessory_${i}`]) {
               EQUIPPED[`accessory_${i}`] = item;
               equippedEmptySlot = true;
               break;
            }
         }

         if (equippedEmptySlot) {
            this.config.equipped = EQUIPPED;
         } else {
            equipRemovedFromSlot = { ...this.config.equipped.accessory_1 };
            this.config.equipped.accessory_1 = item;
         }
      } else {
         let itemType = item.type;

         if (this.config.equipped[itemType]) {
            equipRemovedFromSlot = this.config.equipped[itemType];
            this.config.equipped[itemType] = item;
         } else {
            this.config.equipped[itemType] = item;
         }
      }

      if (equipRemovedFromSlot) {
         this.sendToInventory(equipRemovedFromSlot)
      }

      this._applyMod();
      return this;
   }
   /**
    * Object setter
    * @param {String} key
    * @param {void} value
    */
   set(key, value) {
      this.config[key] = value;
   }
   /**
    * Gold setter, as sums
    * @param {Number} amount
    */
   addGold(amount) {
      this.config.gold += amount;
   }
   /**
    * Gold setter, as sub
    * @param {Number} amount
    */
   removeGold(amount) {
      if (this.config.gold > amount) {
         this.config.gold -= amount;
         return true;
      }
      return false;
   }
   /**
    * Send item to inventory
    * @param {Object} item
    */
   sendToInventory(item) {
      this.config.inventory.push(item);
      return this;
   }
   /**
    * Removes item from inventory
    * @param {Object} item
    */
   removeFromInventory(item) {
      this.config.inventory = _removeItem(this.config.inventory, item);
      return this;
   }
   /**
    * Buys item from store
    * @param {Object} item
    */
   buyItem(item) {
      this.config = buyItem(this, item);
      return this;
   }
   /**
    * @param {Object} item
    */
   sellItem(item) {
      this.config = sellItem(this, item);
      return this;
   }
   /**
    * @param {Number} id
    */
   receiveReward(bag, gold) {
      if (bag.length) {
         this.config.reward.items.push(...bag);
      }
      this.config.reward.gold += gold;
      return this;
   }
   /**
    * Get rewards in loot bag
    */
   getRewards() {
      const LOOT_BAG = this.config.reward;

      if (LOOT_BAG.items.length) {
         this.config.inventory = [...this.config.inventory, ...LOOT_BAG.items];
      }
      this.config.gold += LOOT_BAG.gold;
      this.config.reward = { items: [], gold: 0 };

      return this;
   }
   /**
    * Receive experience after killing monster
    */
   receiveExp(amount) {
      this.config.experience += amount;
      this._calculateLevel();
   }
}
