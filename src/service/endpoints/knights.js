import { characterFactory, gearHandler } from "../../repositories/UserRepositories.js";
import { userSchema } from "../../model/userModel.js";
import { getCharacterByName } from "../controllers/knightController.js";
import * as yup from "yup";
import mongo from "mongodb";
import assert from "assert";
import mongoose from "mongoose"
import CharacterSchema, { RawCharacterSchema } from "../../model/characterModel.js"
import KnightClassController from "../controllers/knightClassController.js";

const yupSchema = yup.default.object().shape({
   body: yup.default.object().required()
})

const KNIGHT_API = "/api/v1/knights/";

export default function (app) {

   // MONGOOSE SYNTAX
   /**
    * @method POST
    * Add character to user
    */
   app.post(KNIGHT_API + "add", async (req, res, next) => {
      await mongoose.connect(process.env.MONGO_SERVER, { useNewUrlParser:true, useUnifiedTopology: true});

      try {
         if (yupSchema.validate(req)) {
            const UserModel = mongoose.model("users", userSchema);
            const user = await UserModel.findOne({ token: req.header("Authorization") })
            const charFactory = await characterFactory(req);
            const userNameExist = await getCharacterByName(req.body.name);

            if (userNameExist) {
               res.status(400).json({ detail: "Name already exists" });
               return;
            }
            if (!user?.email) {
               res.status(401).json({ detail: "Invalid token" })
               return;
            }
            if (!user.emailVerified) {
               res.status(401).json({ detail: "Email not verified" });
               return;
            }

            if (user.permissions.includes(req.body.vocation)) {
               let character = new CharacterSchema({ ...charFactory })
               await character.save();

               await UserModel.findOneAndUpdate(
                  { token: req.header("Authorization") },
                  { $push: { characters: character } }
               );
               res.status(201).json({ content: "Created" });
            } else {
               res.status(401).json({ detail: "Vocation is not unlocked" });
            }
         }
      } catch (err) {
         if (err.message.includes("dup key")) {
            res.status(400).json({ detail: "Name already exists" })
         }
         res.status(500).json({ detail: err.message })
      }
   })

   /**
    * @method GET
    * Login into character
    */
   app.get(KNIGHT_API + "login", async (req, res) => {
      await mongoose.connect(process.env.MONGO_SERVER, { useNewUrlParser:true, useUnifiedTopology: true});

      try {
         const AUTH = req.header("Authorization");
         const CHAR_AUTH = req.header("CharAuth")

         if (AUTH && CHAR_AUTH) {
            const CharModel = mongoose.model("knights", RawCharacterSchema);
            const char = await CharModel.findOne({ token: CHAR_AUTH });

            if (char && char.characterId) {
               return res.status(200).json({ ...char._doc })
            } else {
               return res.status(401).json({ detail: "Character token invalid" })
            }

         } else {
            return res.status(401).json({ detail: "Invalid token" });
         }
      } catch (err) {
         return res.status(500).json({ detail: err.message })
      }
   })

   /**
    * @method GET
    * Find knight by nickname
    */
   app.get(KNIGHT_API + "find", async (req, res, next) => {
      await mongoose.connect(process.env.MONGO_SERVER, { useNewUrlParser:true, useUnifiedTopology: true});

      try {
         if (yupSchema.validate(req)) {
            const UserModel = mongoose.model("knights", RawCharacterSchema);
            const user = await UserModel.find({ nickname: req.query.name })

            if (user && user.length) {
               const userModel = user[0];

               res.status(200).json([{
                  characterId: userModel.characterId,
                  nickname: userModel.nickname,
                  level: userModel.level,
                  cp: userModel.attributes.cp,
                  honor: userModel.honor
               }]);
            } else {
               res.status(404).json([])
            }

         }
      } catch (err) {
         res.status(500).json({ detail: err.message });
      }
   })

   /**
    * @method PUT
    * Add stats to character;
    */
   app.put(KNIGHT_API + "attr/add", async (req, res) => {
      await mongoose.connect(process.env.MONGO_SERVER, { useNewUrlParser:true, useUnifiedTopology: true});

      try {
         const char = KnightClassController.addAttr(req);

         res.status(200).json(char._doc);
      } catch (err) {
         res.status(500).json({ detail: err.message });
      }
   })

   /**
    * @method PUT
    * Equip Item
    */
   app.put(KNIGHT_API + "equip", async (req, res) => {
      await mongoose.connect(process.env.MONGO_SERVER, { useNewUrlParser:true, useUnifiedTopology: true});

      try {
         const char = await KnightClassController.equip(req);

         res.status(200).json(char);
      } catch (err) {
         res.status(500).json({ detail: err.message });
      }
   })

   /**
    * @method PUT
    * Unequip Item
    */
   app.put(KNIGHT_API + "unequip", async (req, res) => {
      await mongoose.connect(process.env.MONGO_SERVER, { useNewUrlParser:true, useUnifiedTopology: true});

      try {
         const char = await KnightClassController.unequip(req);

         res.status(200).json(char);
      } catch (err) {
         res.status(500).json({ detail: err.message });
      }
   })

   /**
    * @method GET
    * Unequip Item
    */
   app.put(KNIGHT_API + "rewards", async (req, res) => {
      await mongoose.connect(process.env.MONGO_SERVER, { useNewUrlParser:true, useUnifiedTopology: true});

      try {
         const char = await KnightClassController.receiveReward(req);

         res.status(200).json(char);
      } catch (err) {
         res.status(500).json({ detail: err.message });
      }
   })

   /**
    * @deprecated
    *
    * MONGO DB SYNTAX
    * Old requests
    *
    */

   app.put(KNIGHT_API + "inventory/discard", async (req, res, next) => {
      try {
         if (yupSchema.validate(req)) {
            const DB_SERVER = process.env.MONGO_SERVER;
            const DB_NAME = process.env.MONGO_DB_NAME;

            let knightData = null;

            mongo.connect(DB_SERVER, { useNewUrlParser:true, useUnifiedTopology: true}, (err, client) => {
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
