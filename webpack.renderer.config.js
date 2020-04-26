const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const config = () => {
  const env = process.env.NODE_ENV;
  return {
    mode: env,
    entry: "./src/renderer/renderer.js",
    target: "electron-renderer",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "renderer.js",
    },
    module: {
      rules: [
        {
          test: /\.elm$/,
          exclude: [/elm-stuff/, /node_modules/],
          use: [
            { loader: "elm-hot-webpack-loader" },
            {
              loader: "elm-webpack-loader",
              options:
                env === "development"
                  ? { debug: true, optimize: false }
                  : { debug: false, optimize: true },
            },
          ],
        },
        {
          test: /\.(s?[ca]ss)$/,
          use: [
            {
              // Adds CSS to the DOM by injecting a `<style>` tag
              loader: "style-loader",
            },
            {
              // Interprets `@import` and `url()` like `import/require()` and will resolve them
              loader: "css-loader",
            },
            {
              // Loader for webpack to process CSS with PostCSS
              loader: "postcss-loader",
              options: {
                plugins: function() {
                  return [require("autoprefixer")];
                },
              },
            },
            {
              // Loads a SASS/SCSS file and compiles it to CSS
              loader: "sass-loader",
            },
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
