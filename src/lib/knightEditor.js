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

export default class {
   constructor(knight) {
      this.config = { ...knight };
   }
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
   }
   _removeItem(list, item) {
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
   _compare(item1, item2) {
      return JSON.stringify(item1) == JSON.stringify(item2);
   }
   unequip(item) {
      for (let equip in this.config.equipped) {
         if (JSON.stringify(item) == JSON.stringify(this.config.equipped[equip])) {
            this.sendToInventory(item);
            this.config.equipped[equip] = null;
         }
      }
      this._applyMod();
      return this;
   }
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
   sendToInventory(item) {
      this.config.inventory.push(item);
      return this;
   }
   removeFromInventory(item) {
      this.config.inventory = this._removeItem(this.config.inventory, item);
      return this;
   }
}