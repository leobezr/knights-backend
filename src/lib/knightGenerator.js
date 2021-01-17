import uniqid from "uniqid"

export default class Knight {
   constructor(options) {
      this.id = uniqid(this.resolveName(options.name) + "-");
      this.name = this.resolveName(options.name);
      this.nickname = options.name || null;
      this.sprite = options.sprite || 0;
      this.gender = options.gender || "female";
      
      this.birthday = Date.now();
      this.experience = 0;
      this.level = 1;

      this.cooldown = {
         train: Date.now(),
         hunt: Date.now(),
         brew: Date.now()
      }

      this.events = {
         dungeon: Date.now(),
      }

      this.equiped = [];
      this.inventory = [];
      this.gold = 0;

      this.attributes = {
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
   resolveName(name) {
      name = name || "";

      return name.toLowerCase().replace(/ /g, "-")
   }
}