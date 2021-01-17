import fs from "fs";
import path from "path";

export default async function () {
    try {
        const DB = fs.readFileSync(path.join(__dirname, "../model/items/items.json"));

        let itemList = JSON.parse(DB);

        return itemList;
    } catch (e) {
        throw e
    }
}