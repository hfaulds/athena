interface Component {
  tick(): void;
  render(body, sprite): void;
}

interface Vec2 {
  x: number;
  y: number;
}

interface Body {
  getPosition(): Vec2;
  setPosition(v: Vec2): void;
  getLinearVelocity(): Vec2;
  getAngularDamping(): Vec2,
  getLinearDamping(): Vec2,
  getAngle(): number;
  createFixture(polygon, attributes): void;
  setAngle(a: number);
  setLinearVelocity(l: Vec2);
}

interface Key {
  isDown: boolean;
  isUp: boolean;
}

interface Input {
  left: Key;
  up: Key;
  right: Key;
  down: Key;
}

interface InputSource {
  gatherInputs(): Array<Input>;
}
