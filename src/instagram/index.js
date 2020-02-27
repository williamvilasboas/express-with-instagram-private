const Publisher = require("./publisher");

const Logout = require("./logout");

const { Login, Challenge, Profile, ChallengeSelect } = require("./login");

module.exports = {
  Publisher,
  Auth: {
    Login,
    Challenge,
    Logout: Logout,
    Profile,
    ChallengeSelect
  }
};
