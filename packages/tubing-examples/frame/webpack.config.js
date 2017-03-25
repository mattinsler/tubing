const path = require('path');

module.exports = {
  entry: {
    'frame-server': path.join(__dirname, 'frame-server'),
    'frame-client': path.join(__dirname, 'frame-client')
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  }
};
