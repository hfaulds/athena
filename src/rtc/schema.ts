import * as SchemaPack from 'schemapack';
import { Buffer } from 'buffer';

var Vec2 = { x: 'float32', y: 'float32' };
var Key = { isDown: 'bool', isUp: 'bool' };

const worldSnapshot = SchemaPack.build({
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

const inputSnapshot = SchemaPack.build([
  {
    left: Key,
    up: Key,
    right: Key,
    down: Key,
  }
]);

const SCHEMAS = {
  'worldSnapshot': worldSnapshot,
  'inputSnapshot': inputSnapshot,
}

export class Schema {
  static encode(schemaName, data) {
    var schemaId = Object.keys(SCHEMAS).indexOf(schemaName);
    var schema = Object.values(SCHEMAS)[schemaId];

    var encodedData = schema.encode(data)
    var buffer = Buffer.alloc(encodedData.length + 1);
    buffer.writeUInt8(schemaId, 0)
    encodedData.copy(buffer, 1, 0);
    return buffer;
  }

  static decode(schemaName, buffer) {
    var schema = SCHEMAS[schemaName];
    return schema.decode(buffer.slice(1));
  }

  static readSchemaName(arrayBuffer) {
    var buffer = Buffer.from(arrayBuffer);
    var schemaId = buffer.readUInt8(0);
    var schemaName = Object.keys(SCHEMAS)[schemaId];
    return schemaName;
  }
}
