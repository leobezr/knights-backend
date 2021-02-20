import { buyItem, sellItem } from "./market.js";
import vocationModifiers from "./vocationModifiers.js";
import uniqid from "uniqid";

const GAIN_STATUS_PER_LEVEL = 5;
const MAX_STATUS_POINTS = 300;

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

export default class {
   constructor(knight) {
      this.config = { ...knight };
   }
   _calculateLevel() {
      let a = (exp) => Math.cbrt(
         Math.sqrt(3) * Math.sqrt((243 * Math.pow(exp, 2)) - (48600 * exp) + 3680000) + (27 * exp) - 2700
      );
      const levelExp = (level) =>
         Math.round((50 * Math.pow(level, 3)) / 3) -
         Math.round(100 * Math.pow(level, 2)) +
         Math.round((850 * Math.pow(level, 1)) / 3) -
         200;

      let exp = this.config.experience;
      let result = ((a(exp) / Math.pow(30, 2 / 3)) - ((5 * Math.pow(10, 2 / 3)) / Math.cbrt(3) / a(exp))) + 2;

      // this.config.level = Math.round(result);
      let level = Math.round(result);

      if (exp >= levelExp(level)) {
         this.config.level = level;
      } else {
         this.config.level = level - 1;
      }
   }
   _calculateTotalDef() {
      var { vit, agi } = this.config.attributes;
      let attr = { vit, agi };

      var { vit, agi, armor } = this.config.modifier;
      let modAttr = { vit, agi, armor };

      const SOFT_DEF = Math.floor(((attr.vit + modAttr.vit) / 2) + ((attr.agi + modAttr.agi) / 3) + (this.config.level / 10));
      this.config.attributes.def = Math.round((SOFT_DEF) * (1 + (modAttr.armor * .05)));
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
         BASE_HP += Math.round((BASE_LEVEL * i) * .03);
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

      switch (this.config.vocation) {
         case "archer":
            this.config.attributes.hit = Math.round(Math.floor(
               (this.config.level / 4) + (totalDex + totalDex * .1) + (totalStr / 5) + (totalLuk / 3)
            ));
            break;
         case "swordman":
         case "knight":
         default:
            this.config.attributes.hit = Math.round(Math.floor(
               (this.config.level / 4) + totalStr + (totalDex / 5) + (totalLuk / 3)
            ));
      }
   }
   /**
    * @returns Amount of attack range equipped
    */
   _calculateMisc(equipped) {
      let attackRange = 15; // Attack Range
      let lifeSteal = 0; // Life Steal

      if (equipped) {
         for (let item in equipped) {
            if (equipped[item].misc && equipped[item].type == item || item.includes("accessory")) {
               attackRange += equipped[item].misc?.attackRange || 0;
               lifeSteal += equipped[item]?.misc?.lifeSteal || 0;
            };
         }
      }
      return { attackRange, lifeSteal };
   }
   _evolveVocation() {
      // TODO: Only evolve if has level
      // Voucher to evolve
      this.config.vocationLevel += 1;
   }
   _updateVocationBuff() {
      this.config.buffs.vocation = vocationModifiers[this.config.vocation]
   }
   /**
    * Apply vocation buff
    * @param {*} attr
    * @returns attr modified
    */
   _applyVocationBuff(attr) {
      const BUFFS = this.config.buffs.vocation;

      for (let stat in BUFFS) {
         attr[stat] += BUFFS[stat];
      }
      return attr;
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
            if (itemsEquipped[item].type == item || item.includes("accessory")) {
               attr[mod] += itemsEquipped[item].attr[mod];
            }
         }
      }

      this._updateVocationBuff();
      attr = this._applyVocationBuff(attr);
      this.config.modifier = { ...attr };

      this.config.misc.attackRange = this._calculateMisc(itemsEquipped).attackRange;
      this.config.misc.lifeSteal = this._calculateMisc(itemsEquipped).lifeSteal;

      this._calculateCP();
      this._calculateHit();
      this._calculateHealth();
      this._calculateTotalDef();
   }
   _removeItem(itemId) {
      const INVENTORY = this.config.inventory;

      for (let index in INVENTORY) {
         if (INVENTORY[index].id == itemId) {
            INVENTORY.splice(index, 1);
            break;
         }
      }

      return INVENTORY
   }
   _vocationCanUseItem(item) {
      if (item.vocationRequired) {
         return item.vocationRequired.includes(this.config.vocation);
      }
      return true
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
    * Create battle session
    * Everything inside partyRoom is assumed to be an ally
    * @param {String} id can be null or false
    */
   createBattleSession(id) {
      const nickname = this.config.nickname
         .trim()
         .replace(/ /g, "-")
         .toLowerCase() + "-";

      const battleSession = {};
      battleSession.id = id || uniqid(nickname);

      this.config.battleSession = battleSession;
      return this;
   }
   /**
    * Joins a battle session
    * @param {String}
    */
   joinBattleSession(id) {
      this.createBattleSession(id);
      return this;
   }
   /**
    * Joins a battle session
    * @param {String}
    */
   joinParty(id) {
      id = id || this.config.characterId;

      if (!this.config.battleSession) {
         this.config.battleSession = {
            id: null,
            party: id
         }
      } else {
         this.config.battleSession.party = id;
      }
      return this;
   }
   /**
    * Removes self from party
    */
   removeParty() {
      this.config.battleSession = {
         id: null,
         party: null
      }

      return this;
   }
   /**
    * Finds item inside knight config
    * @param {Object} item
    * @returns {Object}
    */
   findItem(item) {
      let typeOfItem = typeof item;
      const INVENTORY = this.config.inventory;

      if (typeOfItem == "object") {
         return INVENTORY.filter(search => _compare(item, search))[0];
      } else if (typeOfItem == "number") {
         return INVENTORY.filter(search => search.id == item)[0];
      }

   }
   /**
    * Un-equips item
    * @param {Object} item
    * @param {String} slot
    * @returns {Object}
    */
   unequip(slot) {
      let itemRemovedFromEquip = this.config.equipped[slot];
      if (!itemRemovedFromEquip) return this;

      if (itemRemovedFromEquip.slot.includes("accessories")) {
         this.config.equipped[slot] = null;
      } else {
         for (let slotName of itemRemovedFromEquip.slot) {
            if (this.config.equipped[slotName]) {
               this.config.equipped[slotName] = null;
            }
         }
      }

      this.sendToInventory(itemRemovedFromEquip);
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

      let hasItemInInventory = this.config.inventory.filter(equipment => equipment.id == item.id);

      if (!hasItemInInventory.length || !this._vocationCanUseItem(item)) return this;

      this.removeFromInventory(item);

      item = hasItemInInventory[0];

      const equipItemsNormal = (item) => {
         let itemSlot = item.slot;

         for (let slot in itemSlot) {
            if (this.config.equipped[itemSlot[slot]]) {
               this.unequip(itemSlot[slot]);
               this.config.equipped[itemSlot[slot]] = item;
            } else {
               this.config.equipped[itemSlot[slot]] = item;
            }
         }
      }

      if (item.slot.includes("accessories")) {
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
            this.unequip("accessory_1");
            this.config.equipped.accessory_1 = item;
         }
      } else if (item.slot.includes("weapon") || item.slot.includes("shield")) {
         if (item.type == "shield" || item.slot.includes("weapon") && item.combat == "melee") {
            if (this.config.equipped.weapon?.combat == "ranged") {
               this.unequip("weapon");
               equipItemsNormal(item);
            } else {
               equipItemsNormal(item);
            }
         } else {
            equipItemsNormal(item);
         }
      } else {
         equipItemsNormal(item);
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
      this.config.inventory = [...this._removeItem(item.id)];
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

      return this
   }
   /**
    * Sell all inventory items
    * TODO: Add chest
    */
   sellInventoryItems() {
      const ITEMS = this.config.inventory.map(item => item.id);

      for (let item in ITEMS) {
         this.sellItem(ITEMS[item])
      }
      return this;
   }
   /**
    * Unlocks hunting arena
    * @param {String} level
    */
   unlockLevel(level) {
      if (level) {
         const UNLOCKED = this.config.unlocked.hunt;

         if (!UNLOCKED.includes(level)) {
            this.config.unlocked.hunt.push(level);
         }
      }
      return this;
   }
}
