const {
  InstagramFlux,
  InstagramForbiddenException,
  saveTempFile,
  readTempFile,
  existTempFile
} = require("./lib");

const History = async ({ form: { username, usernamefeed } }) => {
  const instagram = await InstagramFlux({
    form: { username }
  });

  if (instagram === null) {
    throw new InstagramForbiddenException();
  }

  const targetUser = await instagram.user.searchExact(usernamefeed);

  const user = instagram.feed.user(targetUser.pk);

  const fileTemp = { username: usernamefeed, type: "feed-history" };
  if (!(await existTempFile(fileTemp))) {
    const feedItems = await user.items();
    await saveTempFile(feedItems, fileTemp);
  }

  const items = await readTempFile(fileTemp);

  return items;
};

module.exports = {
  History
};
