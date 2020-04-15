const path = require('path');

module.exports = {
  entry: './src/lambda.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ],
  },
  resolve: {
        extensions: [ '.js', '.json', '.jsx']
  }, 
  target: 'node',
  externals: {
    'aws-sdk': 'commonjs2 aws-sdk'
  },
  optimization: {
      minimize: false
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2'
  },
};