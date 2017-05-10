import Entity from './entities/Entity'
import Asteroid from './entities/Asteroid'
import Ship from './entities/Ship'

const CLASSES = {
  "Asteroid": Asteroid,
  "Ship": Ship,
}

export default class EntityLoader {
  static loadSnapshot(snapshot, assets, components, world): Entity {
    return new CLASSES[snapshot.type](
      assets,
      world,
      snapshot.bodyAttributes,
      components,
      snapshot.fixtureAttributes,
      snapshot.textureName,
      snapshot.guid
    );
  }
}
