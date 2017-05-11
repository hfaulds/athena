import * as PIXI from 'pixi.js'

export default class Assets {
  static load(callback) {
    fetch('/assets.json').then(function(res) {
      return res.json();
    }).then(function(assets) {
      PIXI.loader
        .add("images/sheet.json")
        .add("images/purple.png")
        .load(function() {
          callback(assets);
        });
    });
  }
}
