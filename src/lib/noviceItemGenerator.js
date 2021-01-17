import deserializeItems from "./deserializeItems";

export default async function () {
    let itemList = await deserializeItems();

    let armor = itemList.armor.filter(armor => armor.tier == 1)[0];
    let weapon = itemList.weapons.filter(weapon => weapon.tier == 1)[0];
    let shield = itemList.shields.filter(shield => shield.tier == 1)[0];
    let accessory = itemList.accessories.filter(accessory => accessory.tier == 1)[0];

    return {
        armor,
        weapon,
        shield,
        accessory
    };
}