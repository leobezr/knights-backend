import mongo from "mongodb";
import assert from "assert";
import db from "../db.js";
import KnightClassController from "../controllers/knightClassController.js";

const ITEMS_API = "/api/v1/items/";

export default function (app) {
   /**
    * @method POST
    * Sell item in shop
    */
   app.post(ITEMS_API + "sell", async (req, res) => {
      await db();
      try {
         const char = await KnightClassController.sellItem(req);
         res.status(200).json(char);
      } catch (err) {
         res.status(500).json({ detail: err.message });
      }
   })
   /**
    * @method POST
    * Buy item in shop
    */
   app.post(ITEMS_API + "buy", async (req, res) => {
      await db();
      try {
         const char = await KnightClassController.buyItem(req);
         res.status(200).json(char);
      } catch (err) {
         res.status(500).json({ detail: err.message });
      }
   })

   /**
    * @method POST
    * Sell entire inventory
    */
   app.post(ITEMS_API + "sell/inventory", async (req, res) => {
      await db();
      try {
         const char = await KnightClassController.sellInventoryItems(req);
         res.status(200).json(char);
      } catch (err) {
         res.status(500).json({ detail: err.message });
      }
   })

   /**
    * GET Item list
    */
   app.get("/api/v1/items", async (req, res) => {
      const DB = process.env.MONGO_SERVER;
      const DB_NAME = process.env.MONGO_DB_NAME;

      var itemList = {};

      try {
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
      } catch (err) {
         throw Error(err);
      }
   })

   // app.post("/api/v1/items/sell", async (req, res) => {
   //    try {
   //       const DB = process.env.MONGO_SERVER;
   //       const DB_NAME = process.env.MONGO_DB_NAME;
   //       var knightUser = null;

   //       if (yupSchema.validate(req)) {
   //          mongo.connect(DB, (err, client) => {
   //             assert.strictEqual(err, null);

   //             const db = client.db(DB_NAME);
   //             const cursor = db.collection("knights").find({ id: req.body.id });

   //             cursor.forEach((doc) => {
   //                knightUser = gearHandler(doc);
   //                knightUser.sellItem(req.body.item);

   //                let { _id, ...knightData } = knightUser.config;

   //                db.collection("knights").updateOne({ id: req.body.id }, {
   //                   $set: { ...knightData }
   //                })
   //             }, () => {
   //                client.close();

   //                if (knightUser) {
   //                   res.status(200).json({ user: knightUser.config })
   //                } else {
   //                   res.status(400).json({ detail: "User not found" })
   //                }
   //             })
   //          })
   //       }
   //    } catch (err) {
   //       throw Error(err);
   //    }
   // })

   // app.post("/api/v1/items/sell/inventory", async (req, res) => {
   //    try {
   //       const DB = process.env.MONGO_SERVER;
   //       const DB_NAME = process.env.MONGO_DB_NAME;
   //       var knightUser = null;

   //       if (yupSchema.validate(req)) {
   //          mongo.connect(DB, (err, client) => {
   //             assert.strictEqual(err, null);

   //             const db = client.db(DB_NAME);
   //             const cursor = db.collection("knights").find({ id: req.body.id });

   //             cursor.forEach((doc) => {
   //                knightUser = gearHandler(doc);
   //                knightUser.sellInventoryItems();

   //                let { _id, ...knightData } = knightUser.config;

   //                db.collection("knights").updateOne({ id: req.body.id }, {
   //                   $set: { ...knightData }
   //                })
   //             }, () => {
   //                client.close();

   //                if (knightUser) {
   //                   res.status(200).json({ user: knightUser.config })
   //                } else {
   //                   res.status(400).json({ detail: "User not found" })
   //                }
   //             })
   //          })
   //       }
   //    } catch (err) {
   //       throw Error(err);
   //    }
   // })

   // app.post("/api/v1/items/buy", async (req, res) => {
   //    try {
   //       const DB = process.env.MONGO_SERVER;
   //       const DB_NAME = process.env.MONGO_DB_NAME;
   //       var knightUser = null;

   //       if (yupSchema.validate(req)) {
   //          mongo.connect(DB, (err, client) => {
   //             assert.strictEqual(err, null);

   //             const db = client.db(DB_NAME);
   //             const cursor = db.collection("knights").find({ id: req.body.id });

   //             cursor.forEach((doc) => {
   //                knightUser = gearHandler(doc);
   //                knightUser.buyItem(req.body.item);

   //                let { _id, ...knightData } = knightUser.config;

   //                db.collection("knights").updateOne({ id: req.body.id }, {
   //                   $set: { ...knightData }
   //                })
   //             }, () => {
   //                client.close();

   //                if (knightUser) {
   //                   res.status(200).json({ user: knightUser.config })
   //                } else {
   //                   res.status(400).json({ detail: "User not found" })
   //                }
   //             })
   //          })
   //       }
   //    } catch (err) {
   //       throw Error(err);
   //    }
   // })
}
