import * as PIXI from 'pixi.js'
import { Vec2, Polygon } from 'planck-js'

import rand from '../util/rand'

var resources = PIXI.loader.resources;

export default class Asteroid {
  readonly body;
  readonly components;
  readonly sprite;

  constructor(body, components, sprite) {
    this.body = body;
    this.components = components;
    this.sprite = sprite;
  }

  static create(assets, components, position, world) {
    var asset = Object.values(assets["meteors"])[
      Math.floor(Math.random() * Object.keys(assets["meteors"]).length)
    ];
    var textureName = asset.textures[
      Math.floor(Math.random() * asset.textures.length)
    ];
    var sprite = new PIXI.Sprite(
      resources["images/sheet.json"].textures[textureName]
    );

    sprite.pivot = {
      x: sprite.width / 2,
      y: sprite.height / 2,
    }

    var body = world.createBody({
      type : 'dynamic',
      angularDamping : 5.0,
      position : position,
      linearVelocity : Vec2(rand(0.1), rand(0.1)),
    });

    var path = [];
    for (var i = 0; i < asset.mesh.length; i++) {
      path.push(Vec2(asset.mesh[i][0], asset.mesh[i][1]));
    }
    body.createFixture(Polygon(path), {
      density: 1000,
    });
    return new Asteroid(body, components, sprite);
  }

  public tick() {
    this.components.forEach(function(c) {
      c.tick(this.body);
    }.bind(this));
  }

  public render() {
    this.components.forEach(function(c) {
      c.render(this.body, this.sprite);
    }.bind(this));
  }
}
