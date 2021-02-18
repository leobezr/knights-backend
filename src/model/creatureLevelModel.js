import mongoose from "mongoose";

const creatureLevel = new mongoose.Schema({
   "0-15": {
      monsters: Array,
      boss: Object,
      unlocks: String
   },
   "15-30": {
      monsters: Array,
      boss: Object,
      unlocks: String
   },
   "30-50": {
      monsters: Array,
      boss: Object,
      unlocks: String
   },
}, {
   timestamp: true
})

export default mongoose.model("Hunts", creatureLevel);
