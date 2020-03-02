const Publisher = require("./publisher");

const Logout = require("./logout");

const { Login, Challenge, Profile, ChallengeSelect } = require("./login");
const Feed = require("./feed");

module.exports = {
  Publisher,
  Feed,
  Auth: {
    Login,
    Challenge,
    Logout: Logout,
    Profile,
    ChallengeSelect
  }
};
