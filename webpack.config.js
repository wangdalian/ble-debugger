const path = require('path');

module.exports = {
  entry: './src/js/index.js',
  output: {
      path: path.resolve(__dirname, 'src/js'),
    filename: 'bundle.js'
  }
};