import mongoose from "mongoose";
import validator from "validator";
import uniqid from "uniqid";
import crypto from "crypto"

const userSchema = new mongoose.Schema({
   email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: (value) => {
         return validator.isEmail(value)
      }
   },
   password: {
      type: String,
      required: true
   },
   token: {
      type: String
   },
   permissions: {
      type: Array
   },
   characters: {
      type: Array
   },
   emailVerified: {
      type: Boolean,
      default: true
   },
   emailValidateId: {
      type: String,
   },
   chest: {
      type: Array
   },
   config: {
      music: {
         on: {
            type: Boolean,
            default: true
         },
         volume: {
            type: Number,
            default: 100
         }
      },
      sound: {
         on: {
            type: Boolean,
            default: true
         },
         volume: {
            type: Number,
            default: 100
         }
      }
   }
}, {
   timestamp: true
})

const tokenSchema = new mongoose.Schema({
   token: String,
})

userSchema.pre("save", function (next) {
   if (!this.token) {
      this.token = crypto.randomBytes(64).toString("hex");
   }

   this.permissions = ["swordman", "archer"];
   this.chest = [];
   this.characters = [];
   this.emailValidateId = "em-" + uniqid();

   next(null);
});

export default mongoose.model("User", userSchema);
export { userSchema, tokenSchema }
