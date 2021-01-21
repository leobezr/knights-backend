import mongo from "mongodb";
import assert from "assert";

async function getUserById(userId) {
   const DB_SERVER = process.env.MONGO_SERVER;
   const DB_NAME = process.env.MONGO_DB_NAME;

   var knightUser = null;

   return new Promise((resolve, reject) => {
      mongo.connect(DB_SERVER).then((client) => {
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

export {
   getUserById,
}