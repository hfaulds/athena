import * as Schema from 'schemapack';

export const worldSnapshot = Schema.build({
  focusGuid: 'string',
  entities: [
    {
      type: 'string',
      guid: 'string',
      bodyAttributes: {
        angle: 'float32',
        position: { x: 'float32', y: 'float32' },
        velocity: { x: 'float32', y: 'float32' },
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
    left: { isDown: 'bool', isUp: 'bool' },
    up: { isDown: 'bool', isUp: 'bool' },
    right: { isDown: 'bool', isUp: 'bool' },
    down: { isDown: 'bool', isUp: 'bool' },
  }
]);
