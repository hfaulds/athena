import * as PIXI from 'pixi.js'
import { Vec2, Polygon } from 'planck-js'

import Entity from './Entity'

var resources = PIXI.loader.resources;

export default class Ship extends Entity {
  static create(assets, angle, components, position, world) {
    var sprite = new PIXI.Sprite(
      resources["images/sheet.json"].textures[
        assets["ships"]["playerShip1"].texture
      ]
    );
    sprite.pivot = Vec2({
      x: sprite.width / 2,
      y: sprite.height / 2,
    })

    var body = world.createBody({
      type : 'dynamic',
      angularDamping : 2.0,
      linearDamping : 0.5,
      position : position,
      angle : angle,
    });

    var shipMesh = assets["ships"]["playerShip1"].mesh;
    var path = [];

    for (var i = 0; i < shipMesh.length; i++) {
      path.push(Vec2(shipMesh[i][0], shipMesh[i][1]));
    }

    body.createFixture(Polygon(path), {
      density: 100,
    });

    return new Ship(body, components, sprite);
  }
}
