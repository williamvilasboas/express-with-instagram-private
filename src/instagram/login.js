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
  removeCookies
} = require("./lib");

const Login = async ({ form: { username, password } }) => {
  try {
    const ig = new IgApiClient();
    ig.state.generateDevice(username);
    await ig.simulate.preLoginFlow();

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
      return {
        auth: true,
        success: false,
        message: "Sms or email two validation required"
      };
    }

    if (err instanceof IgLoginBadPasswordError) {
      await removeCookies({ username });
      return {
        auth: false,
        success: false,
        error: true,
        message: "user or password not found"
      };
    }
    console.error(err);
  }
};

const Challenge = async ({ form: { username, code } }) => {
  try {
    const ig = new IgApiClient();
    ig.state.generateDevice(username);

    await ig.challenge.auto(true);

    ig.request.end$.subscribe(async () => {
      const serialized = await ig.state.serialize();
      delete serialized.constants; // this deletes the version info, so you'll always use the version provided by the library
      fakeSave(serialized);
    });
    if (fakeExists()) {
      // import state accepts both a string as well as an object
      // the string should be a JSON object
      await ig.state.deserialize(fakeLoad());
    }

    const sendSecurity = await ig.challenge.sendSecurityCode(code);

    return {
      success: true,
      message: "Authorized ok",
      security: sendSecurity
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

module.exports = {
  Login,
  Challenge
};
