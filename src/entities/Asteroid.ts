import { Vec2, Polygon } from 'planck-js'

import Entity from './Entity'
import rand from '../util/rand'

export default class Asteroid extends Entity {
  static createRandom(assets, components, position, world) {
    var asteroidTextures = Object.keys(assets["textures"]["meteors"]);
    var textureName = asteroidTextures[
      Math.floor(Math.random() * asteroidTextures.length)
    ];
    var velocity = Vec2(rand(0.1), rand(0.1));
    var bodyAttributes= {
      type : 'dynamic',
      angularDamping : 5.0,
      linearVelocity : velocity,
      position : position,
    };
    var fixtureAttributes = {
      density: 1000,
    };
    return new Asteroid(
      assets,
      world,
      bodyAttributes,
      components,
      fixtureAttributes,
      textureName
    );
  }
}
