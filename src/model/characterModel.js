import mongoose from "mongoose";
import crypto from "crypto"

const characterSchema = new mongoose.Schema({
   token: {
      type: String,
   },

   characterId: String || Object,
   nickname: {
      type: String,
      required: true,
      unique: true,
   },
   gender: {
      type: String,
      required: true
   },

   experience: {
      type: Number,
      default: 0
   },
   level: {
      type: Number,
      default: 0
   },
   vocation: {
      type: String,
      required: true,
   },

   lastBattles: Array,
   unlocked: {
      hunt: Array,
      quest: Array
   },

   bestiary: {
      monsters: Object,
      coins: Number
   },

   cooldown: {
      train: Date,
      hunt: Date,
      brew: Date,
   },

   spells: Object,

   honor: Number,

   events: {
      dungeon: Date
   },

   equipped: {
      "headgear-top": Object,
      "headgear-middle": Object,
      "headgear-lower": Object,
      armor: Object,
      footgear: Object,
      shield: Object,
      legs: Object,
      weapon: Object,
      accessory_1: Object,
      accessory_2: Object,
      accessory_3: Object,
      accessory_4: Object,
   },

   reward: {
      items: Array,
      gold: Number
   },

   modifier: Object,
   misc: {
      attackRange: Number,
      lifeSteal: Number
   },

   inventory: Array,

   gold: Number,
   buffs: {
      vocation: Object,
      misc: Array
   },

   attributes: {
      cp: Number,
      hit: Number,
      str: Number,
      agi: Number,
      vit: Number,
      dex: Number,
      luk: Number,
      def: Number,
      hp: Number
   }
}, {
   timestamp: true
})

characterSchema.pre("save", function (next) {
   if (!this.token) {
      this.token = crypto.randomBytes(64).toString("hex");
   }
   next(null);
});

export default mongoose.model("Knight", characterSchema);
export { characterSchema as RawCharacterSchema };
