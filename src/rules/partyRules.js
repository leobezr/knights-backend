export default {
   canHuntMonster(level, monsterLevel) {
      return level > Math.floor(monsterLevel / 1.2);
   },
   partyShare(highestLevel, lowestLevel) {
      return lowestLevel > Math.floor(highestLevel / 1.5);
   }
}
