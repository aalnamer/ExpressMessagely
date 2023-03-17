const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");

const Message = require("../models/message");

router.get("/:id", ensureLoggedIn, (req, res, next) => {
  try {
    let username = req.user.username;
    let id = req.params.id;
    let results = new Message.get(id);

    if (
      results.to_user.username !== username &&
      results.from_user.username !== username
    ) {
      throw new ExpressError("Unauthorized", 401);
    }
    return res.json({ message: results });
  } catch (err) {
    next(err);
  }
});

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    let msg = await Message.create({
      from_username: req.user.username,
      to_username: req.body.to_user,
      body: req.body.body,
    });
    return res.json({ message: msg });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/read", ensureLoggedIn, async function (req, res, next) {
  try {
    let username = req.user.username;
    let id = req.params.id;
    let msg = await Message.get(id);
    if (msg.to_user.username !== username) {
      throw new ExpressError("Please Login", 401);
    }
    await Message.markRead(id);
    return res.json({ msg });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
