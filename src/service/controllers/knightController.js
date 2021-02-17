import mongo from "mongodb";
import mongoose from "mongoose";
import assert from "assert";
import { RawCharacterSchema } from "../../model/characterModel.js"

async function getUserById(userId) {
   const DB_SERVER = process.env.MONGO_SERVER;
   const DB_NAME = process.env.MONGO_DB_NAME;

   var knightUser = null;

   return new Promise((resolve, reject) => {
      mongo.connect(DB_SERVER, { useNewUrlParser:true, useUnifiedTopology: true}).then((client) => {
         const db = client.db(DB_NAME);
         const cursor = db.collection("knights").find({ id: userId });

         cursor.forEach((doc, err) => {
            assert.strictEqual(err, undefined);

            knightUser = doc;
         }, () => {
            client.close();

            if (knightUser) {
               resolve(knightUser);
            } else {
               reject("User not found");
            }
         })
      })
   })
}
async function getCharacterByName(name) {
   await mongoose.connect(process.env.MONGO_SERVER, { useNewUrlParser:true, useUnifiedTopology: true});

   try {
      const CharacterModel = mongoose.model("knights", RawCharacterSchema);
      const character = await CharacterModel.findOne({ nickname: name });
      return character;
   } catch (err) {
      throw Error(err);
   }
}

export {
   getUserById,
   getCharacterByName
}
