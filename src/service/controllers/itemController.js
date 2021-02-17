import mongo from "mongodb";
import assert from "assert";

async function getItemList() {
   const DB_SERVER = process.env.MONGO_SERVER;
   const DB_NAME = process.env.MONGO_DB_NAME;

   var itemList = null;

   return new Promise((resolve, reject) => {
      mongo.connect(DB_SERVER).then((client) => {
         const db = client.db(DB_NAME);
         const cursor = db.collection("items").find();

         cursor.forEach((doc, err) => {
            assert.strictEqual(err, undefined);

            itemList = doc;
         }, () => {
            client.close();

            if (itemList) {
               resolve(itemList);
            } else {
               reject("User not found");
            }
         })
      })
   })
}

export {
   getItemList
}