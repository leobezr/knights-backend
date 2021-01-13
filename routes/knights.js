const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const KnightFactory = require("../src/lib/knight.js");

const findKnight = async (req, res, next) => {
  try {
    const DATA = fs.readFileSync(path.join(__dirname, '../models/knights.json'));
    const STATS = JSON.parse(DATA);
    const KNIGHT_STATS = STATS.find(knight => knight.id === Number(req.params.id));

    if (!KNIGHT_STATS) {
      const err = new Error('Knight stats not found');

      err.status = 404;
      throw err;
    }

    res.json(KNIGHT_STATS);
  } catch (e) {
    next(e);
  }
};

const createKnight = async (req, res, next) => {
  try {
    const DATA = fs.readFileSync(path.join(__dirname, '../models/knights.json'));
    const STATS = JSON.parse(DATA);

    const newStats = new KnightFactory({
      nickname: req.body.name,
      sprite: req.body.sprite,
      gender: req.body.gender
    })

    STATS.push(newStats);

    fs.writeFileSync(path.join(__dirname, '../models/knights.json'), JSON.stringify(STATS));
    res.status(201).json(newStats);
  } catch (e) {
    next(e);
  }
};

router
  .route("/api/v1/knights/:id")
  .get(findKnight)

router
  .route("/api/v1/knights/create/")
  .post(createKnight);

module.exports = router;