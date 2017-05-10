import * as PIXI from 'pixi.js'
import { Vec2, Polygon } from 'planck-js'

import Entity from './Entity'
import rand from '../util/rand'

var resources = PIXI.loader.resources;

export default class Asteroid extends Entity {
  static createRandom(assets, components, position, world) {
    var asset = Object.values(assets["meteors"])[
      Math.floor(Math.random() * Object.keys(assets["meteors"]).length)
    ];
    var textureName = asset.textures[
      Math.floor(Math.random() * asset.textures.length)
    ];
    var sprite = new PIXI.Sprite(
      resources["images/sheet.json"].textures[textureName]
    );

    var path = asset.mesh.map(function(p) {
      return Vec2(p[0], p[1]);
    });
    var polygon = Polygon(path);
    var velocity = Vec2(rand(0.1), rand(0.1));
    return Asteroid.create(components, polygon, position, sprite, velocity, world);
  }

  static create(components, polygon, position, sprite, velocity, world) {
    sprite.pivot = Vec2({
      x: sprite.width / 2,
      y: sprite.height / 2,
    });

    var body = world.createBody({
      type : 'dynamic',
      angularDamping : 5.0,
      position : position,
      linearVelocity : velocity,
    });

    body.createFixture(polygon, { density: 1000 });
    return new Asteroid(body, components, sprite);
  }
}
