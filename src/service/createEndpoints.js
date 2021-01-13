export default class {
   constructor(app) {
      this.app = app;
   }
   set(endpoint) {
      endpoint.call(this, this.app);
   }
}