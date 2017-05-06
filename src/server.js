var express = require('express');
var webpack = require('webpack');
var webpackConfig = require('../webpack.config');

var app = express();
var compiler = webpack(webpackConfig);

app.use(require("webpack-dev-middleware")(compiler, {
    noInfo: true, publicPath: webpackConfig.output.publicPath
}));
app.use(require("webpack-hot-middleware")(compiler));

app.use(express.static('public'));

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
})
