const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require('path');

module.exports = {
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080
  },
  entry: "./src/index",
  resolve: {
    extensions: [".jsx", ".js", ".json", ".vue"]
  },
  module: {
    rules: [
      {
        test: /\.vue?$/,
        loader: 'vue-loader'
      },
    ]
  },

  plugins: [
    new ModuleFederationPlugin({
      name: "first",
      library: { type: "var", name: "first" },
      filename: "main.js",
      remotes: {
        vendor: "vendor@http://localhost:8888/remoteVendor.js",
      },
      exposes: {
        
      },
    }),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: "./index.html"
    })
  ],

  experiments: {
    topLevelAwait: true,
  },
};
