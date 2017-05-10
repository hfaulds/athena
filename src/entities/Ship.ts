import Entity from './Entity'

export default class Ship extends Entity {
  static create(assets, angle, components, position, world) {
    var textureName = "playerShip1_red.png";
    var bodyAttributes = {
      type : 'dynamic',
      angularDamping : 2.0,
      linearDamping : 0.5,
      position : position,
      angle : angle,
    };
    var fixtureAttributes = {
      density: 100
    };
    return new Ship(
      assets,
      world,
      bodyAttributes,
      components,
      fixtureAttributes,
      textureName,
    );
  }
}
