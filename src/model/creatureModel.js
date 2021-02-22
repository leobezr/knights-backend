import mongoose from "mongoose";

const monsterSchema = new mongoose.Schema({
   child: new mongoose.Schema({
      id: Number,
      name: String,
      experience: Number,
      level: Number,
      huntingGrounds: {
         stats: Number,
         def: Number,
         damage: Number,
         agi: Number,
         attackRange: Number,
         lifeSteal: Number,
      },
      sprite: {
         path: String,
         spritesheet: String,
         size: String,
         rows: Number,
         cols: Number,
         width: Number,
         height: Number,
         grid: {
            width: Number,
            height: Number
         }
      },
      arena: String,
      sound: {
         attack: String,
         onHit: [String, Object]
      },
      loot: Array,
      gold: {
         min: Number,
         max: Number
      },
   })
}, {
   timestamp: true
})

export default mongoose.model("monsters", monsterSchema);
