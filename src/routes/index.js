const express = require("express");
const request = require("request-promise");
const router = express.Router();

router.get(
  "/embed/feed/:username/:target/:template?",
  async (req, res, next) => {
    try {
      const { username, target, template: templateParam } = req.params;
      const template = require(`../views/${templateParam || "default"}`);

      const feedItems = await request("http://localhost:9028/feed/store", {
        method: "POST",
        json: true,
        body: {
          username,
          usernamefeed: target
        }
      });

      return res.marko(template, {
        list: feedItems
      });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
