import fs from "fs";
import path from "path";
import KnightFactory from "../lib/knightGenerator.js";

export async function getUsers() {
   try {
      const DB = fs.readFileSync(path.join(__dirname, "../model/knights.json"));

      let data = JSON.parse(DB);
      return data;
   } catch (e) {
      next(e)
   }

}

export async function addUser(req) {
   try {
      const DB = fs.readFileSync(path.join(__dirname, '../model/knights.json'));

      let data = JSON.parse(DB);
      let userData = req.body;

      if (!userData) {
         return false
      }

      let newKnightConfig = new KnightFactory(userData);

      data.push(newKnightConfig);

      fs.writeFileSync(path.join(__dirname, '../model/knights.json'), JSON.stringify(data));
      return newKnightConfig;
   } catch (e) {
      throw new Error(e)
   }
}