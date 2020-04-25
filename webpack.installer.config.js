const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const config = (env) => {
  return {
    mode: "none",
    entry: "./src/installer/installer.js",
    target: "electron-renderer",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "installer.js",
    },
    module: {
      rules: [
        {
          test: /\.(png|jpg|gif)$/i,
          use: [
            {
              loader: "url-loader",
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
        filename: "installer.html",
        template: "src/installer/installer.html",
      }),
    ],
  };
};

module.exports = config;
