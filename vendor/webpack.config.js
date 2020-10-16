const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const path = require('path');

module.exports = {
  entry: "./src/index",
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8888
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "vendor",
      library: { type: "var", name: "vendor" },
      filename: "remoteVendor.js",
      exposes: {
        './vue':'./src/vue'
      },
    }),
  ]
};
