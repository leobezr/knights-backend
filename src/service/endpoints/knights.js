import { getUsers, addUser } from "../../repositories/UserRepositories";

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
      const users = await getUsers();

      let uniqueUser = users.filter(user => user.id == req.params.id);

      if (uniqueUser && uniqueUser.length) {
         res.status(200).json(uniqueUser);
      } else {
         res.status(404).json({ detail: "user not found" })
      }
   })

   /**
    * CREATE knights
    */
   app.post("/api/v1/knights/create", async (req, res, next) => {
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
}