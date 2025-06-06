const rules = require('./webpack.rules');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

// Check if we're in production mode
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main/index.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  output: {
    path: path.resolve(__dirname, '.webpack/main'),
    filename: 'index.js',
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // Add node.js-like environment for ESM modules during testing
  target: 'electron-main',
  // Tell Webpack to handle ESM modules
  // experiments: {
  //   outputModule: true,
  // },
  // Add production optimizations
  mode: isProd ? 'production' : 'development',
  optimization: isProd ? {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 2020,
          compress: {
            passes: 2,
          },
          mangle: true,
        },
      }),
    ],
  } : {},
  externals: {
    '@sentry/electron': "require('@sentry/electron')",
    'electron-log': "require('electron-log')",
    'electron-updater': "require('electron-updater')",
    typeorm: "require('typeorm')",
    keytar: "require('keytar')",
  },
}; 