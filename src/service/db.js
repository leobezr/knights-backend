import mongoose from "mongoose";

export default async function () {
   if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGO_SERVER, {
         poolSize: 10,
         useNewUrlParser: true,
         useUnifiedTopology: true,
         autoIndex: false,
      });
   }
   return;
}
