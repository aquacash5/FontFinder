const path = require("path");

const config = () => {
  const env = process.env.NODE_ENV || "production";
  return {
    mode: env,
    entry: "./src/main/main.js",
    target: "electron-main",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "main.js",
    },
    node: {
      __dirname: false,
    },
  };
};

module.exports = config;
