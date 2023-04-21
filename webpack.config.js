const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const pkg = require('./package.json');

const LIBRARY_NAME = 'BoxCastSDK';

const config = {
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
  entry: './src/index.ts',
  target: ['web', 'node'], // default target is web
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index.js',
    libraryTarget: 'umd',
    globalObject: 'this',
    libraryExport: 'default',
    umdNamedDefine: true,
    library: LIBRARY_NAME,
    chunkLoading: false, // needed to enable target: ['web', 'node'] https://github.com/webpack/webpack/issues/11660
    wasmLoading: false, // needed to enable target: ['web', 'node'] https://github.com/webpack/webpack/issues/11660
  },
  node: {
    global: true,
    __filename: false,
    __dirname: false,
  },
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'cheap-module-source-map';
  } else if (argv.mode === 'production') {
  } else {
    throw new Error('Specify env');
  }

  return config;
};
