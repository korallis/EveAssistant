const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const path = require('path');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    alias: {
      // Add aliases for frequently used directories to simplify imports
      '@components': path.resolve(__dirname, 'src/renderer/components'),
      '@routes': path.resolve(__dirname, 'src/renderer/routes'),
      '@common': path.resolve(__dirname, 'src/renderer/components/common'),
      '@layout': path.resolve(__dirname, 'src/renderer/components/layout'),
      '@theme': path.resolve(__dirname, 'src/renderer/theme'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  optimization: {
    // Enable code splitting
    splitChunks: {
      chunks: 'all',
      // Create a separate vendor chunk for node_modules
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: -10,
        },
        // Group Material-UI packages together
        mui: {
          test: /[\\/]node_modules[\\/]@mui/,
          name: 'material-ui',
          chunks: 'all',
          priority: 0,
        },
        // Group React packages together
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)/,
          name: 'react-core',
          chunks: 'all',
          priority: 0,
        },
      },
    },
  },
}; 