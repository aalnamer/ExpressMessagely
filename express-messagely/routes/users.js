const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const User = require("../models/user");

router.get("/", ensureLoggedIn, async (req, res, next) => {
  try {
    let users = await User.all();
    console.log(users);
    return res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.get("/:username", ensureCorrectUser, async (req, res, next) => {
  try {
    let user = await User.get(req.params.username);
    return res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get("/:username/to", ensureCorrectUser, async (req, res, next) => {
  try {
    let username = req.params.usernamer;
    let messages = await User.messagesTo(username);
    return res.json({ messages });
  } catch (err) {
    next(err);
  }
});
router.get("/:username/from", ensureCorrectUser, async (req, res, next) => {
  try {
    let username = req.params.usernamer;
    let messages = await User.messagesFrom(username);
    return res.json({ messages });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
