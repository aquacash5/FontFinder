const fs = require("fs").promises;
const path = require("path");

module.exports = async (context) => {
  await fs.mkdir(path.resolve(__dirname, "publish"), {
    recursive: true,
  });
  await Promise.allSettled(
    context.artifactPaths.map((p) =>
      fs.rename(p, path.resolve(__dirname, "publish", path.basename(p)))
    )
  );
};
