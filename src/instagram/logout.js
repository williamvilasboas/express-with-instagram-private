const {
  removeCookies,
  InstagramFlux,
  InstagramForbiddenException
} = require("./lib");

const Logout = async ({ form: { username } }) => {
  const instagram = await InstagramFlux({ form: { username } });

  if (instagram === null) {
    throw new InstagramForbiddenException();
  }

  return removeCookies({ username });
};

module.exports = { Logout };
