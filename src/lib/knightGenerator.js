import uniqid from "uniqid"

export default class Knight {
   constructor(options) {
      this.id = uniqid(this.resolveName(options.name) + "-");
      this.name = this.resolveName(options.name);
      this.nickname = options.nickname || null;
      this.birthday = Date.now();
      this.sprite = options.sprite || 0;
      this.gender = options.gender || "female";

      this.weapons = [
         {
            name: "wooden sword",
            damage: 11,
            attr: "strength",
            equipped: true
         }
      ];

      this.attributes = {
         strength: 0,
         dexterity: 0,
         defense: 0,
         constitution: 0,
         intelligence: 0,
         wisdom: 0,
         charisma: 0
      }
   }
   resolveName(name) {
      name = name || "";

      return name.toLowerCase().replace(/ /g, "-")
   }
}