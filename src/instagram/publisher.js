const { readFile } = require("fs");

const { promisify } = require("util");

const readFileAsync = promisify(readFile);

const { InstagramFlux, InstagramForbiddenException } = require("./lib");

const Photo = async ({ form: { username, fileName, caption }, ...rest }) => {
  const instagram = await InstagramFlux({ form: { username } });

  if (instagram === null) {
    throw new InstagramForbiddenException();
  }

  const publishResult = await instagram.publish.photo({
    // read the file into a Buffer
    file: await readFileAsync(fileName),
    caption,
    ...rest
    // optional
    // location: mediaLocation,
    // optional
  });

  // console.log(publishResult);

  return publishResult;
};

const Album = async ({ form: { username, items, caption }, ...rest }) => {
  const instagram = await InstagramFlux({ form: { username } });

  if (instagram === null) {
    throw new InstagramForbiddenException();
  }

  const publishResult = await instagram.publish.album({
    items: await Promise.all(
      items.map(async file => ({
        width: 800,
        height: 800,
        file: await readFileAsync(file)
      }))
    ),
    caption,
    ...rest
  });
  return publishResult;
};

const Delete = async ({ form: { username, media_id } }) => {
  const instagram = await InstagramFlux({ form: { username } });
  if (instagram === null) {
    throw new InstagramForbiddenException();
  }
};

module.exports = {
  Photo,
  Album,
  Delete
};
