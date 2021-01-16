const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const me = async (req, res, next) => {
   try {
      const DATA = fs.readFileSync(path.join(__dirname, '../models/knights.json'));
      const STATS = JSON.parse(DATA);

      // const KNIGHT_STATS = STATS.find(knight => knight.id === req.getHeader("token"));

      // if (!KNIGHT_STATS) {
      //    const err = new Error('Profile not found');

      //    err.status = 404;
      //    throw err;
      // }

      res.json(req);
   } catch (e) {
      next(e);
   }
};
router
   .route("/api/v1/me")
   .get(me)

module.exports = router;