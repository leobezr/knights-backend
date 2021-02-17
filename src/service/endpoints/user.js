import * as yup from "yup";
import mongoose from "mongoose"
import UserSchema, { userSchema } from "../../model/userModel.js";
import bcrypt from "bcrypt";
import validateEmail from "../../subscribers/sendEmail.js";
import { RawCharacterSchema } from "../../model/characterModel.js"

const yupSchema = yup.default.object().shape({
   body: yup.default.object().required()
})

const USER_API = "/api/v1/user/";

export default function (app) {
   app.post(USER_API + "create", async (req, res, next) => {
      await mongoose.connect(process.env.MONGO_SERVER, { useNewUrlParser:true, useUnifiedTopology: true});

      try {
         if (yupSchema.validate(req)) {
            let newUser = new UserSchema({
               email: req.body.email,
               password: req.body.password
            })

            const saltRounds = 10;
            const userPassword = newUser.password;

            const genHash = () => new Promise(resolve => {
               bcrypt.genSalt(saltRounds, function (err, salt) {
                  bcrypt.hash(userPassword, salt, function (err, hash) {
                     resolve(hash);
                  });
               });
            })

            let hash = await genHash();
            newUser.set("password", hash);

            await newUser.save();

            validateEmail({
               to: req.body.email,
               token: newUser.emailValidateId
            })

            mongoose.connection.close();
            res.status(201).json({ email: req.body.email, password: req.body.password })
         }
      } catch (err) {
         if (err.message.includes("dup key")) {
            res.status(400).json({ detail: "E-mail already exists" });
         }
         mongoose.connection.close();
         next();
      }
   })

   app.post(USER_API + "login", async (req, res, next) => {
      await mongoose.connect(process.env.MONGO_SERVER, { useNewUrlParser:true, useUnifiedTopology: true});

      try {
         if (yupSchema.validate(req)) {
            const Model = mongoose.model("Users", userSchema);
            let user = await Model.findOne({ email: req.body.email });

            if (!user.email) {
               return res.status(404).json({ detail: "User not found" });
            }
            if (!user.emailVerified) {
               return res.status(401).json({ detail: "Email not verified" })
            }

            const hasValidPassword = (password, hash) => new Promise(resolve => {
               bcrypt.compare(password, hash, function (err, result) {
                  resolve(result);
               });
            })

            let result = await hasValidPassword(req.body.password, user.password)

            if (result) {
               res.status(200).json({ token: user.token });
            } else {
               res.status(401).json({ detail: "Incorrect password" });
            }
            mongoose.connection.close();
         }
      } catch (err) {
         res.status(401).json({ detail: err.message });
      }
   })

   app.get(USER_API + "char-list", async (req, res) => {
      await mongoose.connect(process.env.MONGO_SERVER, { useNewUrlParser:true, useUnifiedTopology: true});

      try {
         const AUTH = req.header("Authorization");

         if (AUTH) {
            const UserModel = mongoose.model("users", userSchema);
            const user = await UserModel.findOne({ token: AUTH });

            let charListInUser = user.characters.map(char => char.nickname);

            const CharacterModel = mongoose.model("knights", RawCharacterSchema);
            let charList = await Promise.all(charListInUser.map(async charName => {
               let char = await CharacterModel.findOne({ nickname: charName })
               if (char) return char;
            }))

            res.status(200).json(charList);

         } else {
            res.status(401).json({ detail: "Invalid token" })
         }
      } catch (err) {

      }
   })

   app.put(USER_API + "verify/:emailId", async (req, res) => {
      await mongoose.connect(process.env.MONGO_SERVER, { useNewUrlParser:true, useUnifiedTopology: true});

      try {
         const Model = mongoose.model("Users", userSchema);
         let user = await Model.findOne({ emailValidateId: req.params.emailId });

         if (user && user.id) {
            user.emailVerified = true;
            user.save();

            res.status(200).json({ token: user.token });
         } else {
            res.status(401).json({ detail: "Unknown email Id" });
         }
      } catch (err) {
         res.status(500).json({ detail: err.message });
      }
   })

   app.get(USER_API + "profile/", async (req, res) => {
      await mongoose.connect(process.env.MONGO_SERVER, { useNewUrlParser:true, useUnifiedTopology: true});

      try {
         const UserModel = mongoose.model("users", userSchema);
         const user = await UserModel.findOne({ token: req.header("Authorization") });

         if (!user || !user?._doc) {
            res.status(404).json({ detail: "User not found" });
         }
         let { password, ...data } = user._doc

         res.status(200).json({ ...data });
      } catch (err) {
         res.status(500).json({ detail: err.message });
      }
   })
}
