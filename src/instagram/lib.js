const path = require("path");

const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const existAsync = promisify(fs.exists);
const { IgApiClient } = require("instagram-private-api");

const { COOKIES_PATH, TEMP_PATH } = process.env;

const getFile = (
  username,
  type = "instagram",
  options = { path: COOKIES_PATH }
) => {
  if (options.path === undefined) {
    throw new Error(`ENV ${options.path} not defined`);
  }
  return path.join(`${options.path}/${type}-${username}.json`);
};

const saveCookies = (data = {}, { username }) => {
  var filename = getFile(username);

  fs.writeFileSync(filename, JSON.stringify(data), "utf8");

  // here you would save it to a file/database etc.
  // you could save it to a file: writeFile(path, JSON.stringify(data))
  return data;
};

const existCookies = ({ username }) => {
  const filename = getFile(username);
  if (fs.existsSync(filename)) {
    return true;
  }
  // here you would check if the data exists
  return false;
};

const removeCookies = async ({ username }) => {
  return await unlinkAsync(getFile(username));
};

const loadCookies = ({ username }) => {
  // here you would load the data
  return fs.readFileSync(getFile(username), "utf8");
};

const readTempFile = async ({ username, type = "state" }) => {
  return await readFileAsync(getFile(username, type, { path: TEMP_PATH }));
};

const existTempFile = async ({ username, type = "state" }) => {
  const filename = getFile(username, type, { path: TEMP_PATH });
  if (await existAsync(filename)) {
    return true;
  }
  // here you would check if the data exists
  return false;
};

const saveTempFile = async (data = {}, { username, type = "state" }) => {
  var filename = getFile(username, type, { path: TEMP_PATH });

  await writeFileAsync(filename, JSON.stringify(data), "utf8");

  // here you would save it to a file/database etc.
  // you could save it to a file: writeFile(path, JSON.stringify(data))
  return data;
};

const InstagramFlux = async ({ form: { username } }) => {
  const ig = new IgApiClient();
  ig.state.generateDevice(username);
  await ig.simulate.preLoginFlow();
  if (existCookies({ username })) {
    // import state accepts both a string as well as an object
    // the string should be a JSON object
    await ig.state.deserialize(loadCookies({ username }));
    return ig;
  }

  return null;
};

function InstagramException(type, options = {}) {
  this.name = "InstagramException";
  this.type = type;
  this.options = options;
  this.status = options.status || 500;
  this.toJson = () => {
    return {
      error: type,
      options
    };
  };
}

function InstagramForbiddenException() {
  this.name = "InstagramForbiddenException";
  this.type = "user_not_found";
  const options = (this.options = {
    message: "Usuário não esta logado",
    status: 403
  });
  this.status = 403;

  this.toJson = () => {
    return {
      error: "user_not_found",
      options
    };
  };
}

module.exports = {
  getFile,
  saveCookies,
  existCookies,
  loadCookies,
  removeCookies,
  InstagramFlux,
  readTempFile,
  saveTempFile,
  existTempFile,
  InstagramException,
  InstagramForbiddenException
};
