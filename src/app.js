require("marko/node-require");

const express = require("express");

const bodyParser = require("body-parser");
const path = require("path");

const markoExpress = require("marko/express");

const app = express();

const { UPLOAD_PATH } = process.env;

const { Publisher, Auth, Feed } = require("./instagram");

const routes = require("./routes");

app.use(markoExpress());

const {
  InstagramException,
  InstagramForbiddenException
} = require("./instagram/lib");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get("/status", async (req, res) => res.send({ status: "ok" }));

app.post("/auth/sign-in", async (req, res) => {
  const { username, password } = req.body;
  try {
    return res.send(
      await Auth.Login({
        form: {
          username,
          password
        }
      })
    );
  } catch (e) {
    console.log(e);
    res.send("error");
  }
});

app.post("/auth/get-profile", async (req, res, next) => {
  const { username } = req.body;
  try {
    return res.send(
      await Auth.Profile({
        form: {
          username
        }
      })
    );
  } catch (e) {
    next(e);
  }
});

app.post("/auth/sign-in/verification/sms", async (req, res, next) => {
  const { code, username } = req.body;
  try {
    return res.send(
      await Auth.Challenge({
        form: {
          username,
          code
        }
      })
    );
  } catch (e) {
    console.log(e);
    return next(e);
  }
});

app.post("/auth/sign-in/challenge-select", async (req, res, next) => {
  const { username } = req.body;
  try {
    return res.send(
      await Auth.ChallengeSelect({
        form: {
          username
        }
      })
    );
  } catch (e) {
    console.log(e);
    return next(e);
  }
});

app.post("/auth/logout", async (req, res, next) => {
  try {
    const { username } = req.body;
    return res.send(
      await Auth.Logout.Logout({
        form: { username }
      })
    );
  } catch (err) {
    return next(err);
  }
});

app.post("/publish/photo", async (req, res, next) => {
  try {
    const { username, file, caption } = req.body;
    return res.send(
      await Publisher.Photo({
        form: {
          username,
          fileName: path.join(UPLOAD_PATH, file),
          caption
        }
      })
    );
  } catch (err) {
    return next(err);
  }
});

app.post("/publish/album", async (req, res, next) => {
  try {
    const { username, files, caption } = req.body;
    return res.send(
      await Publisher.Album({
        form: {
          username,
          caption,
          items: files.map(file => path.join(UPLOAD_PATH, file))
        }
      })
    );
  } catch (err) {
    return next(err);
  }
});

app.post("/feed/store", async (req, res, next) => {
  try {
    const { username, usernamefeed } = req.body;
    return res.send(await Feed.History({ form: { username, usernamefeed } }));
  } catch (err) {
    return next(err);
  }
});

app.use(routes);

app.use(async (err, req, res, next) => {
  if (
    err instanceof InstagramException ||
    err instanceof InstagramForbiddenException
  ) {
    return res.status(err.status).send(err.toJson());
  }
  console.log(err);
  return res.status(500).send(err);
});

module.exports = app;
