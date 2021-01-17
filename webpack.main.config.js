const path = require("path");
const webpack = require("webpack");
const fs = require("fs");

const pkgJson = JSON.parse(fs.readFileSync("package.json"));

const isWindows = /^win/.test(process.platform);
const isMac = /^darwin$/.test(process.platform);
const isLinux = /^linux$/.test(process.platform);

const isPackaged = (process.env.BUILD_PACKAGE || "false") === "true";

const env = process.env.NODE_ENV || "production";
const isProduction = env === "production";

const config = () => {
  return {
    mode: env,
    entry: "./src/main/main.js",
    target: "electron-main",
    devtool: isProduction ? undefined : "source-map",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "main.js",
    },
    module: {
      rules: [
        {
          test: /\.(ico|icns|png)/,
          use: [
            {
              loader: "url-loader",
              options: {
                limit: 10_000,
                encoding: "base64",
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __PODUCTION__: isProduction,
        __DEVELOPMENT__: !isProduction,
        __VERSION__: JSON.stringify(pkgJson.version),
        __PACKAGED__: isPackaged,
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
