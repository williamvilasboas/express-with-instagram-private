const path = require("path");

const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const readFileAsync = promisify(fs.readFile);
const { IgApiClient } = require("instagram-private-api");

const { COOKIES_PATH } = process.env;

const getFile = (username, type = "instagram") => {
  if (COOKIES_PATH === undefined) {
    throw new Error("ENV COOKIES_PATH not defined");
  }
  return path.join(`${COOKIES_PATH}/${type}-${username}.json`);
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

const readTempFile = async ({ username }) => {
  return await readFileAsync(getFile(username, "state"));
};

const saveTempFile = (data = {}, { username }) => {
  var filename = getFile(username, "state");

  fs.writeFileSync(filename, JSON.stringify(data), "utf8");

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
  InstagramException,
  InstagramForbiddenException
};
