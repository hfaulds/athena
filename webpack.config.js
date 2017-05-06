module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: __dirname + '/dist'
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.tsx?$/,
        use: "ts-loader"
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: "source-map-loader"
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".json"]
  },
  devtool: 'inline-source-map'
};
