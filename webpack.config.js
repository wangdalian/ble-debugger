const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: './src/js/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'js/index.js'
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname, '.'),
      dry: false
    }),
    new CopyWebpackPlugin([
      {
        from: './src/index.html',
        to: 'index.html'
      },
      {
        from: './src/css',
        to: 'css'
      },
      {
        from: './src/img',
        to: 'img'
      },
      {
        from: './src/lib',
        to: 'lib'
      }
    ])
  ]
}