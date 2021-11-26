const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx",
  output: {
    filename: "[name]-[fullHash].bundle.js",
    path: path.resolve(__dirname, "public"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      sharedComponents: path.resolve(__dirname, "src/sharedComponents/"),
      sharedTypes: path.resolve(__dirname, "src/sharedTypes/index.ts"),
      theme: path.resolve(__dirname, "src/theme.tsx"),
      utilities: path.resolve(__dirname, "src/utilities/"),
    },
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: 3000,
    hot: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.template.ejs",
      favicon: "./src/favicon.png",
      inject: "body",
    }),
  ],
};
