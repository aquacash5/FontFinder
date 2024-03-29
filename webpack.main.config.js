const { StatsWriterPlugin } = require("webpack-stats-plugin");
const fs = require("fs");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const Visualizer = require("webpack-visualizer-plugin2");
const webpack = require("webpack");

const pkgJson = JSON.parse(fs.readFileSync("package.json"));

const isWindows = /^win/.test(process.platform);
const isMac = /^darwin$/.test(process.platform);
const isLinux = /^linux$/.test(process.platform);

const isPackaged = (process.env.BUILD_PACKAGE ?? "false") === "true";
const isBeta = (process.env.BETA_RELEASE ?? "false") === "true";

const env = process.env.NODE_ENV ?? "production";
const isProduction = env === "production";
const buildDirectory = path.join(__dirname, "build");

module.exports = [
  {
    mode: env,
    entry: "./src/main/main.js",
    target: "electron-main",
    output: {
      path: buildDirectory,
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
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
              passes: 3,
            },
          },
        }),
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
        __BETA__: isBeta,
      }),
      new StatsWriterPlugin({
        filename: path.join("..", "stats", "log-main.json"),
        fields: null,
        stats: { chunkModules: true },
      }),
      new Visualizer({
        filename: path.join("..", "stats", "statistics-main.html"),
      }),
    ],
    node: {
      __dirname: false,
    },
  },
  {
    mode: env,
    entry: "./src/main/preload.js",
    target: "electron-preload",
    output: {
      path: buildDirectory,
      filename: "preload.js",
    },
    plugins: [
      new StatsWriterPlugin({
        filename: path.join("..", "stats", "log-preload.json"),
        fields: null,
        stats: { chunkModules: true },
      }),
      new Visualizer({
        filename: path.join("..", "stats", "statistics-preload.html"),
      }),
    ],
  },
];
