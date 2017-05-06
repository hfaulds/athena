import { Vec2 } from 'planck-js'

import Key from '../Key.ts'

var Keyboard = {
  left: Key.listen(65), // a
  up: Key.listen(87), // w
  right: Key.listen(68), // d
  down: Key.listen(83), // s
};

export default class KeyboardInput {
  public tick(body) {
    // Set velocities
    if (Keyboard.left.isDown && Keyboard.right.isUp) {
      body.applyAngularImpulse(0.1, true);
    } else if (Keyboard.right.isDown && Keyboard.left.isUp) {
      body.applyAngularImpulse(-0.1, true);
    }

    // Thrust: add some force in the ship direction
    if (Keyboard.up.isDown && Keyboard.down.isUp) {
      var f = body.getWorldVector(Vec2(0.0, 1.0));
      var p = body.getWorldPoint(Vec2(0.0, 2.0));
      body.applyLinearImpulse(f, p, true);
    } else if (Keyboard.down.isDown && Keyboard.up.isUp) {
      var f = body.getWorldVector(Vec2(0.0, -0.2));
      var p = body.getWorldPoint(Vec2(0.0, 2.0));
      body.applyLinearImpulse(f, p, true);
    }
  }

  render() {}
}
