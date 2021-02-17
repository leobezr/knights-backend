import CreateEndpoints from "./service/createEndpoints.js";
import knights from "./service/endpoints/knights.js";
import items from "./service/endpoints/items.js";
import hunt from "./service/endpoints/hunt.js";
import user from "./service/endpoints/user.js";

export default function (app) {
   const ENDPOINTS = new CreateEndpoints(app);

   ENDPOINTS.set(knights);
   ENDPOINTS.set(items);
   ENDPOINTS.set(hunt);
   ENDPOINTS.set(user);
}
