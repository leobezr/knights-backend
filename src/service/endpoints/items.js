import deserializeItems from "../../lib/deserializeItems.js";

export default function (app) {
   /**
    * GET Item list
    */
   app.get("/api/v1/items", async (req, res) => {
      const items = await deserializeItems();

      res.json({ items });
   })
}