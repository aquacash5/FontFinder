const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

const env = process.env.NODE_ENV ?? "production";
const isProduction = env === "production";
const buildDirectory = path.join(__dirname, "build");

module.exports = {
  mode: env,
  entry: "./src/renderer/renderer.js",
  target: "browserslist:last 1 electron version",
  output: {
    path: buildDirectory,
    filename: "renderer.js",
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
    new HtmlWebpackPlugin({
      filename: "renderer.html",
      title: null,
    }),
  ],
  devServer: {
    compress: true,
    port: 9000,
  },
};
