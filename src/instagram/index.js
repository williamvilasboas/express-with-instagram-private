const Publisher = require("./publisher");

const Logout = require("./logout");

const { Login, Challenge } = require("./login");

module.exports = {
  Publisher,
  Auth: {
    Login,
    Challenge,
    Logout: Logout
  }
};
