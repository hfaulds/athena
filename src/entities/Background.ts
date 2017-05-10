import * as PIXI from 'pixi.js'

import Entity from './Entity'

var resources = PIXI.loader.resources;

export default class Background extends Entity {
  protected readonly sprite: PIXI.extras.TilingSprite;

  constructor(sprite, readonly source: Entity) {
    super(null, [], sprite);
  }

  static create(source) {
    var sprite = new PIXI.extras.TilingSprite(
      resources["images/purple.png"].texture
    );
    return new Background(sprite, source);
  }

  public render() {
    this.sprite.width = window.innerWidth;
    this.sprite.height = window.innerHeight;
    this.sprite.tilePosition.x = this.source.getPosition().x * 100;
    this.sprite.tilePosition.y = this.source.getPosition().y * 100;
  }
}
