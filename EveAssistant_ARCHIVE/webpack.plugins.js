const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// Only add production optimizations when in production mode
const isProd = process.env.NODE_ENV === 'production';
const isAnalyze = process.env.ANALYZE === 'true';

const plugins = [
  // Run TypeScript type checking in a separate process
  new ForkTsCheckerWebpackPlugin(),
  
  // Define process.env variables
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  }),
];

// Add bundle analyzer if ANALYZE flag is set
if (isAnalyze) {
  plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'server',
      analyzerPort: 8888,
      openAnalyzer: true,
    })
  );
}

// Add production-only plugins
if (isProd) {
  // Minimize JS output in production
  plugins.push(
    new TerserPlugin({
      parallel: true,
      terserOptions: {
        ecma: 2020,
        compress: {
          passes: 2,
        },
        mangle: true,
      },
    })
  );
}

module.exports = plugins; 