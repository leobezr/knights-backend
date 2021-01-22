const itemPriceModifier = {
   selling: (goldValue, tierValue, honorLevel) => Math.round((goldValue * tierValue) * (.1 + (honorLevel * .001))),
   buying: (goldValue, tierValue, honorLevel) => Math.round((goldValue * tierValue) / (.1 + (honorLevel * .001)))
}

const itemLevelRule = (level, itemTier) => {
   return level > Math.round(itemTier * (itemTier - 1) + ((itemTier - 1) / .3));
}

export function sellItem(knight, item) {

   if (knight.findItem(item)) {
      knight.removeFromInventory(item);
      knight.addGold(itemPriceModifier.selling(item.gold, item.tier, knight.config.honor || 0))
   }

   return knight.config;
}

export function buyItem(knight, item) {
   if (itemLevelRule(knight.config.level, item.tier)) {
      if (knight.removeGold(itemPriceModifier.buying(item.gold, item.tier, knight.config.honor || 0))) {
         knight.sendToInventory(item);
      }
   }
   return knight.config;
}