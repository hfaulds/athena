import * as PIXI from 'pixi.js'
var resources = PIXI.loader.resources;

export default class Background {
  readonly sprite;
  readonly source;

  constructor(sprite, source) {
    this.sprite = sprite
    this.source = source
  }

  static create(source) {
    var sprite = new PIXI.extras.TilingSprite(
      resources["images/purple.png"].texture
    );
    return new Background(sprite, source);
  }

  public tick() {}

  public render() {
    this.sprite.width = window.innerWidth;
    this.sprite.height = window.innerHeight;
    this.sprite.tilePosition.x = this.source.body.getPosition().x * 100;
    this.sprite.tilePosition.y = this.source.body.getPosition().y * 100;
  }
}
