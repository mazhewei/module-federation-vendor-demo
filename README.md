# webpack5 模块联邦功能用于依赖项分离

目前网上的项目都是模块联邦用于组件，所以整一个用于依赖的。

## 项目

- app

  用于指代业务项目，为了简单，示例中只是用插值表达式输出hello app。

- vendor

  用于指代提供依赖的项目，为了简单，示例中只包含了一个Vuejs2.x。

## 更多

webpack5的模块联邦确实很有意思，特别时好像这个依赖或者组件就是在本地的一样。

我确信还会有更多的用法被开发出来。

## 如何运行示例

cd vendor

npm run i & npm run serve

依赖工程会运行在http://localhost:8888/下。

另起一个终端，执行

cd app

npm run i & npm run serve

应用工程会运行在http://localhost:8080/下

打开浏览器，访问http://localhost:8080/，观察是否输出hello app.

## 如何自己搭建

1. 先准备两个工程，初始化(npm init -y)

2. 添加开发依赖依赖（两个工程都装或者安装到全局）

   npm i --save-dev webpack webpack-cli webpack-dev-server

   如果发现安装了4.x版本的webpack，你可以手动指定安装版本

   npm i --save-dev webpack@5.0.0 webpack-cli@4.0.0 webpack-dev-server

   在app工程中，还需要多装一个html-webpack-plugin

   npm i --save-dev html-webpack-plugin

3. 为依赖工程添加依赖

   例如：npm i --save vue

4. 为两个工程创建webpack.config.js文件

   在vendor中，

   ```javascript
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
         // 这个文件名会写到app应用的html里面去
         filename: "remoteVendor.js",
         exposes: {
           // 要暴露给其他应用使用的模块
           // 以./开头
           './vue':'./src/vue'
         },
       }),
     ]
   };
   ```

   其中，src/vue文件，只要正常的像使用ES6模块一样export内容就可以。

   在app中，

   ```javascript
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
     // 这一块是VueLoader的用法，参考：https://vue-loader.vuejs.org/zh/guide/
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
           // 使用远程(remote)的模块，名字是ModuleFederationPlugin定义的那个
           vendor: "vendor",
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
       // 使用了顶层文件异步加载，要把这个webpack的实验性功能开启
       topLevelAwait: true,
     },
   };
   ```

5. 在app工程的index.html中，添加对vendor工程的引用

   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>app</title>
     <!-- 添加对vendor的引用 -->
     <script src="http://localhost:8888/remoteVendor.js"></script>
   </head>
   <body>
     <div id="app"></div>
   </body>
   </html>
   ```

6. 在app工程的index.js中，使用remote依赖

   这里用的是Vuejs2.x，Vuejs3.0应该也可以。

   ```javascript
   'use strict';
   const Vue = await import('vendor/vue')
   import App from './App.vue'
   // 因为导出时用了export default, 所以有这个default, 这不是Vuejs的东西, 只是导出了default
   new Vue.default({
     render: h => h(App)
   }).$mount('#app')
   ```

   使用了顶层异步加载，所以要开启实验性选项。

## 一个疑问

看到别人写的demo有这样写的：

```javascript
remotes: {
    vendor: "vendor@http://localhost:8888/remoteVendor.js",
},
```

但是我自己尝试，总是报错：

```
ERROR in main.js from Terser
Unexpected character '@' [main.js:9705,23]
    at js_error (D:\workspace\module-federation-vendor-demo\app\node_modules\terser-webpack-plugin\node_modules\terser\dist\bundle.min.js:538:11)
    at parse_error (D:\workspace\module-federation-vendor-demo\app\node_modules\terser-webpack-plugin\node_modules\terser\dist\bundle.min.js:680:9)
    at Object.next_token [as input] (D:\workspace\module-federation-vendor-demo\app\node_modules\terser-webpack-plugin\node_modules\terser\dist\bundle.min.js:1098:9)
    at peek (D:\workspace\module-federation-vendor-demo\app\node_modules\terser-webpack-plugin\node_modules\terser\dist\bundle.min.js:1231:56)
    at expr_atom (D:\workspace\module-federation-vendor-demo\app\node_modules\terser-webpack-plugin\node_modules\terser\dist\bundle.min.js:2458:52)
    at maybe_unary (D:\workspace\module-federation-vendor-demo\app\node_modules\terser-webpack-plugin\node_modules\terser\dist\bundle.min.js:3234:19)
    at expr_ops (D:\workspace\module-federation-vendor-demo\app\node_modules\terser-webpack-plugin\node_modules\terser\dist\bundle.min.js:3285:24)
    at maybe_conditional (D:\workspace\module-federation-vendor-demo\app\node_modules\terser-webpack-plugin\node_modules\terser\dist\bundle.min.js:3290:20)
    at maybe_assign (D:\workspace\module-federation-vendor-demo\app\node_modules\terser-webpack-plugin\node_modules\terser\dist\bundle.min.js:3367:20)
    at maybe_assign (D:\workspace\module-federation-vendor-demo\app\node_modules\terser-webpack-plugin\node_modules\terser\dist\bundle.min.js:3377:32)
```

## 参考资料

- [webpack - Module Federation](https://webpack.js.org/concepts/module-federation/)
- [module-federation/*module*-*federation*-examples](https://github.com/module-federation/module-federation-examples)
- [webpack5 升级实验](https://zhuanlan.zhihu.com/p/81122986)
- [精读《Webpack5 新特性 - 模块联邦》](https://zhuanlan.zhihu.com/p/115403616)
- [Webpack 5 Module Federation: JavaScript 架构的变革者](https://zhuanlan.zhihu.com/p/120462530)
- [调研 Federated Modules，应用秒开，应用集方案，微前端加载方案改进等](https://mp.weixin.qq.com/s/WAYezuzMKJjn3SECiy1KVA)
- [webpack-5-module-federation-a-game-changer-to-javascript-architecture](https://medium.com/swlh/webpack-5-module-federation-a-game-changer-to-javascript-architecture-bcdd30e02669)