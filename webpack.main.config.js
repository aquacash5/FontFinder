const path = require("path");
const webpack = require("webpack");

const isWindows = /^win/.test(process.platform);
const isMac = /^darwin$/.test(process.platform);
const isLinux = /^linux$/.test(process.platform);

const env = process.env.NODE_ENV || "production";
const isProduction = env === "production";

const config = () => {
  return {
    mode: env,
    entry: "./src/main/main.js",
    target: "electron-main",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "main.js",
    },
    devtool: isProduction ? undefined : "source-map",
    plugins: [
      new webpack.DefinePlugin({
        __PODUCTION__: isProduction,
        __DEVELOPMENT__: !isProduction,
        __WINDOWS__: isWindows,
        __MACOS__: isMac,
        __LINUX__: isLinux,
      }),
    ],
    node: {
      __dirname: false,
    },
  };
};

module.exports = config;
