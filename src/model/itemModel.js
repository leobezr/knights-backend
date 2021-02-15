import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
   "headgear-top": {
      type: Array,
      required: true
   },
   "headgear-middle": {
      type: Array,
      required: true
   },
   "headgear-lower": {
      type: Array,
      required: true
   },
   accessories: {
      type: Array,
      required: true
   },
   armor: {
      type: Array,
      required: true
   },
   legs: {
      type: Array,
      required: true
   },
   footgear: {
      type: Array,
      required: true
   },
   shields: {
      type: Array,
      required: true
   },
   weapons: {
      type: Array,
      required: true
   },
}, {
   timestamp: true
})

export default mongoose.model("items", itemSchema);
