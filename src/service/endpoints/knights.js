import { getUsers, addUser, gearHandler } from "../../repositories/UserRepositories";
import { getUserById } from "../controllers/knightController.js";
import * as yup from "yup";

import mongo from "mongodb";
import assert from "assert";

const yupSchema = yup.object().shape({
   body: yup.object().required()
})

export default function (app) {
   /**
    * GET Knights
    */
   app.get("/api/v1/knights", async (req, res) => {
      const users = await getUsers();

      res.json({ users });
   })
   /**
    * GET Knight using ID
    */
   app.get("/api/v1/knights/:id", async (req, res) => {
      const DB = process.env.MONGO_SERVER;
      var knightUser = null;

      mongo.connect(DB, (err, client) => {
         assert.strictEqual(null, err);

         const db = client.db("test");
         const cursor = db.collection("knights").find({ id: req.params.id });

         cursor.forEach((doc, error) => {
            assert.strictEqual(undefined, error);
            knightUser = doc;
         }, () => {
            client.close()

            if (knightUser) {
               res.status(200).json({ user: { ...knightUser } });
            } else {
               res.status(404).json({ detail: "User not found" });
            }
         })
      })
   })

   /**
    * CREATE knights
    */
   app.post("/api/v1/knights/create", async (req, res, next) => {
      try {
         if (yupSchema.validate(req.body)) {
            const newUser = await addUser(req);
            const DB = process.env.MONGO_SERVER

            mongo.connect(DB, (err, client) => {
               assert.strictEqual(null, err);

               const db = client.db("test");

               db.collection("knights").insertOne(newUser, (error, result) => {
                  assert.strictEqual(null, error);
                  client.close();
               })
            });

            res.status(201).json({ user: newUser });
         } else {
            throw "Body is required"
         }
      } catch (e) {
         next(e)
         throw (e);
      }
   })

   /**
    * PUT knight equip handlers
    */
   app.put("/api/v1/knights/equip", async (req, res, next) => {
      try {
         if (yupSchema.validate(req)) {
            const DB_SERVER = process.env.MONGO_SERVER;
            const DB_NAME = process.env.MONGO_DB_NAME;

            let knightData = null;

            mongo.connect(DB_SERVER, (err, client) => {
               assert.strictEqual(null, err);

               const db = client.db(DB_NAME);
               const cursor = db.collection("knights").find({ id: req.body.id });

               cursor.forEach((doc) => {
                  knightData = gearHandler(doc).equip(req.body.equip).config;
                  let { _id, ...char } = knightData;

                  db.collection("knights").updateOne({ id: req.body.id }, {
                     $set: { ...char }
                  });
               }, () => {
                  if (knightData) {
                     res.status(200).json({ ...knightData });
                  } else {
                     res.status(400).json({ detail: "Not modified" });
                  }
                  client.close();
               });

            })
         } else {
            throw "Request required body"
         }
      } catch (err) {
         res.status(404).json({ detail: err });
         next();
      }
   })

   app.put("/api/v1/knights/unequip", async (req, res, next) => {
      try {
         if (yupSchema.validate(req)) {
            const DB_SERVER = process.env.MONGO_SERVER;
            const DB_NAME = process.env.MONGO_DB_NAME;

            let knightData = null;

            mongo.connect(DB_SERVER, (err, client) => {
               assert.strictEqual(null, err);

               const db = client.db(DB_NAME);
               const cursor = db.collection("knights").find({ id: req.body.id });

               cursor.forEach((doc) => {
                  knightData = gearHandler(doc).unequip(req.body.equip).config;
                  let { _id, ...char } = knightData;

                  db.collection("knights").updateOne({ id: req.body.id }, {
                     $set: { ...char }
                  })
               }, () => {

                  if (knightData) {
                     res.status(200).json({ ...knightData });
                  } else {
                     res.status(400).json({ detail: "Not modified" });
                  }
                  client.close();
               })
            })
         } else {
            throw "Request required body"
         }
      } catch (err) {
         res.status(404).json({ detail: err });
         next();
      }
   })

   app.put("/api/v1/knights/inventory/discard", async (req, res, next) => {
      try {
         if (yupSchema.validate(req)) {
            const DB_SERVER = process.env.MONGO_SERVER;
            const DB_NAME = process.env.MONGO_DB_NAME;

            let knightData = null;

            mongo.connect(DB_SERVER, (err, client) => {
               assert.strictEqual(null, err);

               const db = client.db(DB_NAME);
               const cursor = db.collection("knights").find({ id: req.body.id });

               cursor.forEach((doc) => {
                  knightData = gearHandler(doc).removeFromInventory(req.body.equip).config;
                  let { _id, ...char } = knightData;

                  db.collection("knights").updateOne({ id: req.body.id }, {
                     $set: { ...char }
                  })
               }, () => {

                  if (knightData) {
                     res.status(200).json({ ...knightData });
                  } else {
                     res.status(400).json({ detail: "Not modified" });
                  }
                  client.close();
               })
            })
         } else {
            throw "Request required body"
         }
      } catch (err) {
         res.status(404).json({ detail: err });
         next();
      }
   })
}