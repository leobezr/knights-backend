import mongoose from "mongoose"
import ItemModel from "../../model/itemModel.js";

export default class {
   static async _dropItemCollection() {
      return await mongoose.connection.db.dropCollection("items");
   }
   static async updateItems(itemList) {
      await this._dropItemCollection();

      const ItemCollection = new ItemModel(itemList);
      await ItemCollection.save();
   }
}
