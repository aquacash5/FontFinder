const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const env = process.env.NODE_ENV || "production";
const isProduction = env === "production";
const buildDirectory = path.join(__dirname, "build");

const config = () => {
  return {
    mode: env,
    entry: "./src/renderer/renderer.js",
    target: "electron-renderer",
    output: {
      path: buildDirectory,
      filename: "renderer.js",
    },
    devtool: isProduction ? undefined : "source-map",
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
        filename: "renderer.html",
        title: null,
      }),
    ],
    devServer: {
      contentBase: buildDirectory,
      compress: true,
      port: 9000,
    },
  };
};

module.exports = config;
