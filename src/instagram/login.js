const {
  IgApiClient,
  //   IgLoginTwoFactorRequiredError,
  IgCheckpointError,
  IgLoginBadPasswordError
  //   IgNoCheckpointError,
} = require("instagram-private-api");

const {
  saveCookies,
  existCookies,
  loadCookies,
  removeCookies,
  InstagramFlux,
  InstagramForbiddenException
} = require("./lib");

const memory = {};

const Login = async ({ form: { username, password } }) => {
  const ig = new IgApiClient();
  ig.state.generateDevice(username);
  await ig.simulate.preLoginFlow();
  if (existCookies({ username })) {
    await removeCookies({ username });
  }
  try {
    ig.request.end$.subscribe(async () => {
      const serialized = await ig.state.serialize();
      delete serialized.constants; // this deletes the version info, so you'll always use the version provided by the library
      saveCookies(serialized, { username });
    });

    if (existCookies({ username })) {
      // import state accepts both a string as well as an object
      // the string should be a JSON object
      await ig.state.deserialize(loadCookies({ username }));
      return {
        auth: true,
        success: true,
        login: await ig.account.currentUser()
      };
    }

    const login = await ig.account.login(username, password);

    return {
      auth: true,
      success: true,
      message: "Authorized!",
      login
    };
  } catch (err) {
    if (err instanceof IgCheckpointError) {
      memory[username] = ig;
      return {
        auth: true,
        success: false,
        message: "Sms or email two validation required",
        login: {}
      };
    }

    if (err instanceof IgLoginBadPasswordError) {
      await removeCookies({ username });
      return {
        auth: false,
        success: false,
        error: true,
        message: "user or password not found",
        login: {}
      };
    }
    console.error(err);
  }
};

const Challenge = async ({ form: { username, code } }) => {
  try {
    const ig = memory[username];
    ig.request.end$.subscribe(async () => {
      const serialized = await ig.state.serialize();
      delete serialized.constants; // this deletes the version info, so you'll always use the version provided by the library
      saveCookies(serialized, { username });
    });
    if (existCookies({ username })) {
      // import state accepts both a string as well as an object
      // the string should be a JSON object
      await ig.state.deserialize(loadCookies({ username }));
    }

    const { logged_in_user } = await ig.challenge.sendSecurityCode(code);

    return {
      success: true,
      message: "Authorized ok",
      login: logged_in_user
    };
  } catch (e) {
    await removeCookies({ username });
    return {
      success: false,
      error: true,
      message: "Authorized fail!",
      info: e
    };
  }
};

const ChallengeSelect = async ({ form: { username } }) => {
  const instagram = memory[username];
  // const instagram = await InstagramFlux({ form: { username } });
  // await instagram.challenge.auto(true);

  if (instagram === null) {
    throw new InstagramForbiddenException();
  }

  return await instagram.challenge.auto(true);
  // return await instagram.challenge.selectVerifyMethod("sms");
};

const Profile = async ({ form: { username } }) => {
  const instagram = await InstagramFlux({ form: { username } });

  if (instagram === null) {
    throw new InstagramForbiddenException();
  }

  return await instagram.account.currentUser();
};

module.exports = {
  Login,
  Challenge,
  Profile,
  ChallengeSelect
};
