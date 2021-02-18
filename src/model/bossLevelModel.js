import mongoose from "mongoose";

const bossLevel = new mongoose.Schema({
   "0-15": {
      challenge: [
         {
            name: String,
            gif: String,
            thumb: String,
            level: Number
         }
      ],
      "stage-1": {
         name: Array,
         count: Number,
         boss: [Object, Boolean, Array]
      },
      "stage-2": {
         name: Array,
         count: Number,
         boss: [Object, Boolean, Array]
      },
      "stage-3": {
         name: Array,
         count: Number,
         boss: [Object, Boolean, Array]
      },
      "stage-4": {
         name: Array,
         count: Number,
         boss: [Object, Boolean, Array]
      },
      "stage-5": {
         name: Array,
         count: Number,
         boss: [Object, Boolean, Array]
      },
   },
   "15-30": {
      challenge: [
         {
            name: String,
            gif: String,
            thumb: String,
            level: Number
         }
      ],
      "stage-1": {
         name: Array,
         count: Number,
         boss: [Object, Boolean, Array]
      },
      "stage-2": {
         name: Array,
         count: Number,
         boss: [Object, Boolean, Array]
      },
      "stage-3": {
         name: Array,
         count: Number,
         boss: [Object, Boolean, Array]
      },
      "stage-4": {
         name: Array,
         count: Number,
         boss: [Object, Boolean, Array]
      },
      "stage-5": {
         name: Array,
         count: Number,
         boss: [Object, Boolean, Array]
      },
   },
}, {
   timestamp: true
})

export default mongoose.model("bosses", bossLevel);
