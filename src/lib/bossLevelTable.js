export default function (level) {
   const currentLevels = ["0-15", "15-30", "30-50", "50-80"];

   let nextLevel = currentLevels[currentLevels.indexOf(level) + 1];

   if (nextLevel) {
      return nextLevel
   }
   return false;
}
