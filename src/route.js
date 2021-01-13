import CreateEndpoints from "./service/createEndpoints.js";
import knights from "./service/endpoints/knights.js";

export default function (app) {
   const ENDPOINTS = new CreateEndpoints(app);

   ENDPOINTS.set(knights);

   /**
    * Testing
    */
   app.get("/api/v1/teste", async (req, res) => {
      const users = ["teste", "teste2"];

      res.json({ users });
   });

   return app;
}