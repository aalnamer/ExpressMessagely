const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const User = require("../models/user");

router.get("/", (req, res, next) => {
  res.send("APP IS WORKING!!!");
});

router.post("/login", async (req, res, next) => {
  try {
    let { username, password } = req.body;
    if (!username || !password) {
      throw new ExpressError("Username/Password Required", 400);
    }
    if (await User.authenticate(username, password)) {
      let token = jwt.sign({ username }, SECRET_KEY);
      User.updateLoginTimestamp(username);
      return res.json({ message: "Logged in!", token });
    } else {
      throw new ExpressError("Invalid username/password", 400);
    }
  } catch (err) {
    return next(err);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const { username, password, first_name, last_name, phone } = req.body;
    if (!username || !password || !first_name || !last_name || !phone) {
      throw new ExpressError("Data Required", 400);
    }
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const user = await User.register(
      username,
      hashedPassword,
      first_name,
      last_name,
      phone
    );
    let token = jwt.sign({ username }, SECRET_KEY);
    User.updateLoginTimestamp(username);
    return res.json({ user, token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
