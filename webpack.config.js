/* global __dirname, require, module*/

const webpack = require('webpack');
const path = require('path');
const env = require('yargs').argv.env; // use --env with webpack 2
const pkg = require('./package.json');

let libraryFileName = 'boxcast-sdk';
let libraryName = 'BoxCastSDK';

let outputFile, mode;

if (env === 'build') {
  mode = 'production';
  outputFile = libraryFileName + '-latest.min.js';
} else {
  mode = 'development';
  outputFile = libraryFileName + '.js';
}

const config = {
  mode: mode,
  entry: __dirname + '/src/index.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/lib',
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true,

    // This needs to be set to 'this' instead of the default 'self', since this package
    // is accessed via the browser (script tag), or the server (npm install & require())
    // Further reading: https://webpack.js.org/configuration/output/#outputglobalobject
    globalObject: 'this'
  },
  plugins: [
    new webpack.DefinePlugin({
      NPM_VERSION: JSON.stringify(pkg.version)
    })
  ],
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    modules: [path.resolve('./node_modules'), path.resolve('./src')],
    extensions: ['.json', '.js']
  }
};

module.exports = config;
