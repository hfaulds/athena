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
}
