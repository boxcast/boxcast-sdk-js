const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const pkg = require('./package.json');


const LIBRARY_NAME = 'BoxCastSDK';

const generalConfig = {
  mode: 'none',
  watchOptions: {
    aggregateTimeout: 600,
    ignored: /node_modules/,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NPM_VERSION: JSON.stringify(pkg.version)
      }
    }),
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
      cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, './dist')],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};

const nodeConfig = {
  entry: './src/node.ts',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'node.js',
    libraryTarget: 'umd',
    libraryExport: 'default',
  },
};

const browserConfig = {
  entry: './src/browser.ts',
  target: 'web',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'browser.js',
    libraryTarget: 'umd',
    globalObject: 'this',
    libraryExport: 'default',
    umdNamedDefine: true,
    library: LIBRARY_NAME,
  },
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    generalConfig.devtool = 'cheap-module-source-map';
  } else if (argv.mode === 'production') {
  } else {
    throw new Error('Specify env');
  }

  Object.assign(nodeConfig, generalConfig);
  Object.assign(browserConfig, generalConfig);

  return [nodeConfig, browserConfig];
};
