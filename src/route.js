import CreateEndpoints from "./service/createEndpoints.js";
import knights from "./service/endpoints/knights.js";
import items from "./service/endpoints/items.js";

export default function (app) {
   const ENDPOINTS = new CreateEndpoints(app);

   ENDPOINTS.set(knights);
   ENDPOINTS.set(items);
}