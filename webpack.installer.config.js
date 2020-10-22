const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const config = () => {
  const env = process.env.NODE_ENV || "production";
  return {
    mode: env,
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
            "style-loader",
            "css-loader",
            {
              // Loader for webpack to process CSS with PostCSS
              loader: "postcss-loader",
              options: {
                plugins: function() {
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
        filename: "installer.html",
        template: "src/installer/installer.html",
      }),
    ],
  };
};

module.exports = config;
