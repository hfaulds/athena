import * as Schema from 'schemapack';

var Vec2 = { x: 'float32', y: 'float32' };
var Key = { isDown: 'bool', isUp: 'bool' };

export const worldSnapshot = Schema.build({
  focusGuid: 'string',
  entities: [
    {
      type: 'string',
      guid: 'string',
      bodyAttributes: {
        angle: 'float32',
        position: Vec2,
        velocity: Vec2,
        angularDamping: 'float32',
        linearDamping: 'float32',
      },
      fixtureAttributes: {
        density: 'uint16',
      },
      textureName: 'string',
    }
  ]
});

export const inputSnapshot = Schema.build([
  {
    left: Key,
    up: Key,
    right: Key,
    down: Key,
  }
]);
