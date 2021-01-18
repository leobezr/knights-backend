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
   unequip(item) {
      for (let equip in this.config.equipped) {
         if (JSON.stringify(item) == JSON.stringify(this.config.equipped[equip])) {
            this.sendToInventory(item);
            this.config.equipped[equip] = null;
         }
      }
   }
   equip(item) {
      const EQUIPPED = { ...this.config.equipped };
      var equippedItem = null;

      this.removeFromInventory(item);

      if (item.type == "accessories") {
         let { accessory_1, accessory_2, accessory_3, accessory_4 } = EQUIPPED;

         if (!accessory_1) {
            EQUIPPED.accessory_1 = item;
         } else if (!accessory_2) {
            EQUIPPED.accessory_2 = item;
         } else if (!accessory_3) {
            EQUIPPED.accessory_3 = item;
         } else if (!accessory_4) {
            EQUIPPED.accessory_4 = item;
         } else {
            equippedItem = { ...EQUIPPED.accessory_1 };
            EQUIPPED.accessory_1 = item;
         }
      } else {
         let itemType = item.type;

         if (this.config.equipped[itemType]) {
            equippedItem = this.config.equipped[itemType];
            this.config.equipped[itemType] = item;
         } else {
            this.config.equipped[itemType] = item;
         }
      }

      if (equippedItem) {
         this.sendToInventory(equippedItem)
      }

      this._applyMod();
   }
   sendToInventory(item) {
      this.config.inventory.push(item);
   }
   removeFromInventory(item) {
      const INVENTORY = this.config.inventory;

      this.config.inventory.splice(INVENTORY.indexOf(item), 1);
   }
}