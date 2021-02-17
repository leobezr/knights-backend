export default function (itemList) {
    let armor = itemList.armor.filter(armor => armor.tier == 1)[0];
    let shield = itemList.shields.filter(shield => shield.tier == 1)[0];
    let accessory = itemList.accessories.filter(accessory => accessory.tier == 1)[0];

    return {
        armor,
        shield,
        accessory_1: accessory
    };
}
