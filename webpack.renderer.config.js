const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const env = process.env.NODE_ENV || "production";
const isProduction = env === "production";

const config = () => {
  return {
    mode: env,
    entry: "./src/renderer/renderer.js",
    target: "electron-renderer",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "renderer.js",
    },
    devtool: isProduction ? undefined : "source-map",
    module: {
      rules: [
        {
          test: /\.elm$/,
          exclude: [/elm-stuff/, /node_modules/],
          use: [
            { loader: "elm-hot-webpack-loader" },
            {
              loader: "elm-webpack-loader",
              options: { debug: !isProduction, optimize: isProduction },
            },
          ],
        },
        {
          test: /\.(s?[ca]ss)$/,
          use: [
            "style-loader",
            "css-loader",
            {
              // Loader for webpack to process CSS with PostCSS
              loader: "postcss-loader",
              options: {
                plugins: function () {
                  return [require("autoprefixer")];
                },
              },
            },
            "sass-loader",
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: "Font Finder",
        filename: "renderer.html",
      }),
    ],
  };
};

module.exports = config;
