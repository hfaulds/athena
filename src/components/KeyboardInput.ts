import { Vec2 } from 'planck-js'

export default class KeyboardInput {
  constructor(
    private readonly inputSource: InputSource
  ) { }

  public tick(body) {
    this.inputSource.gatherInputs().forEach(function(input) {
      // Set velocities
      if (input.left.isDown && input.right.isUp) {
        body.applyAngularImpulse(0.1, true);
      } else if (input.right.isDown && input.left.isUp) {
        body.applyAngularImpulse(-0.1, true);
      }

      // Thrust: add some force in the ship direction
      if (input.up.isDown && input.down.isUp) {
        var f = body.getWorldVector(Vec2(0.0, 1));
        var p = body.getWorldPoint(Vec2(0.0, 2.0));
        body.applyLinearImpulse(f, p, true);
      } else if (input.down.isDown && input.up.isUp) {
        var f = body.getWorldVector(Vec2(0.0, -0.2));
        var p = body.getWorldPoint(Vec2(0.0, 2.0));
        body.applyLinearImpulse(f, p, true);
      }
    });
  }

  render() {}
}
