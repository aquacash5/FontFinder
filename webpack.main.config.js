const path = require("path");

const config = env => {
  return {
    mode: "none",
    entry: "./src/main/main.js",
    target: "electron-main",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "main.js"
    },
    node: {
      __dirname: false
    }
  };
};

module.exports = config;
