import mongoose from "mongoose";

const monsterSchema = new mongoose.Schema({
   child: new mongoose.Schema({
      id: Number,
      name: String,
      experience: Number,
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
