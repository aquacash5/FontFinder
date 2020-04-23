var HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const config = (env) => {
  return {
    mode: "none",
    entry: "./src/renderer/index.js",
    target: "electron-renderer",
    output: {
      path: path.resolve(__dirname, "dist"),
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
                env && env.production
                  ? {
                      debug: false,
                      optimize: true,
                    }
                  : {
                      debug: true,
                      optimize: false,
                    },
            },
          ],
        },
        {
          test: /\.(scss)$/,
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
                plugins: function () {
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
      }),
    ],
  };
};

module.exports = config;
