import mongo from "mongodb";
import assert from "assert";

export default function (app) {
   /**
    * GET Item list
    */
   app.get("/api/v1/items", async (req, res) => {
      const DB = process.env.MONGO_SERVER;
      const DB_NAME = process.env.MONGO_DB_NAME;

      var itemList = {};

      mongo.connect(DB, (err, client) => {
         assert.strictEqual(null, err);

         const db = client.db(DB_NAME);
         const cursor = db.collection("items").find();

         cursor.forEach((doc, err) => {
            assert.strictEqual(undefined, err);
            itemList = doc;
         }, () => {
            client.close();

            if (itemList) {
               res.status(200).json({ ...itemList });
            } else {
               res.status(404).json({ detail: "Item list not found" })
            }
         })
      })
   })
}