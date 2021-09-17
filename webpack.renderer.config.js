const { StatsWriterPlugin } = require("webpack-stats-plugin");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const Visualizer = require("webpack-visualizer-plugin2");
const webpack = require("webpack");

const env = process.env.NODE_ENV ?? "production";
const isProduction = env === "production";
const buildDirectory = path.join(__dirname, "build");

const pkgJson = JSON.parse(fs.readFileSync("package.json"));

const isWindows = /^win/.test(process.platform);
const isMac = /^darwin$/.test(process.platform);
const isLinux = /^linux$/.test(process.platform);

const isPackaged = (process.env.BUILD_PACKAGE ?? "false") === "true";
const isBeta = (process.env.BETA_RELEASE ?? "false") === "true";

const entryPoints = fs
  .readdirSync(path.join(process.cwd(), "src", "renderer", "entries"))
  .map((p) => [p.split(".")[0], path.resolve("src", "renderer", "entries", p)])
  .reduce((acc, cur) => ({ ...acc, [cur[0]]: cur[1] }), {});

module.exports = {
  mode: env,
  entry: entryPoints,
  target: "browserslist:last 1 electron version",
  output: {
    path: buildDirectory,
    filename: "[name].js",
  },
  devtool: isProduction ? false : "source-map",
  module: {
    rules: [
      {
        test: /\.elm$/,
        exclude: [/elm-stuff/, /node_modules/],
        use: [
          {
            loader: "elm-webpack-loader",
            options: { debug: !isProduction, optimize: isProduction },
          },
        ],
      },
      {
        test: /\.(s?[ca]ss)$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.png$/,
        use: ["file-loader"],
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
      filename: path.join("..", "stats", "log-renderers.json"),
      fields: null,
      stats: { chunkModules: true },
    }),
    new Visualizer({
      filename: path.join("..", "stats", "statistics-renderers.html"),
    }),
    ...Object.keys(entryPoints).map(
      (entry) =>
        new HtmlWebpackPlugin({
          filename: `${entry}.html`,
          title: null,
          chunks: [entry],
        })
    ),
  ],
  devServer: {
    compress: true,
    port: 9000,
  },
};
