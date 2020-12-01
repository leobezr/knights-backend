import express from "express";
import cors from "cors";

import { getUsers, addUser } from "./repositories/UserRepositories";

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded());

app.use(cors({
   origin: "*",
   optionsSuccessStatus: 200
}));

app.listen(3333);

// routes
app.get("/api/v1/knights", async (req, res) => {
   const users = await getUsers();

   res.json({ users });
})

app.post("/api/v1/knight/create", async (req, res, next) => {
   try {
      const newUser = await addUser(req);

      if (!newUser) {
         res.status(404).json({ user: {} })
         throw new Error("404");
      }

      res.status(201).json({ user: newUser });
   } catch (e) {
      next(e)
   }
})