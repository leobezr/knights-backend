const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const findMonster = async (req, res, next) => {
   try {
      const MONSTERS = fs.readFileSync(path.join(__dirname, '../models/monsters.json'));
      const STATS = JSON.parse(MONSTERS);
      const MONSTER_STATS = STATS.find(knight => knight.name === req.params.name);

      if (!MONSTER_STATS) {
         const err = new Error('Monster stats not found');

         err.status = 404;
         throw err;
      }

      const RACE = fs.readFileSync(path.join(__dirname, `../models/race/${MONSTER_STATS.race}.json`));
      const RACE_RESISTANCE = JSON.parse(RACE);

      MONSTER_STATS.resistance = RACE_RESISTANCE;

      res.json(MONSTER_STATS);
   } catch (e) {
      next(e);
   }
};

router
   .route(["/api/v1/monsters/:name"])
   .get(findMonster);

module.exports = router;