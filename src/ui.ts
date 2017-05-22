import * as PIXI from 'pixi.js'

import Entity from './entities/Entity'

export default class UI {
  private readonly sprite;

  constructor(
    readonly source: Entity
  ) {
    this.sprite = new PIXI.Text('Health: ' + source.health);
    this.sprite.x = 30;
    this.sprite.y = 30;
  }

  public getSprite() {
    return this.sprite;
  }

  public render() {
    this.sprite.text = 'Health: ' + this.source.health;
  }
}
