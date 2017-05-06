export default class RenderRelativeTo {
  readonly source;

  constructor(source) {
    this.source = source
  }

  public tick() {}

  public render(body, sprite) {
    sprite.x = this.source.sprite.x - (body.getPosition().x - this.source.body.getPosition().x) * 100;
    sprite.y = this.source.sprite.y - (body.getPosition().y - this.source.body.getPosition().y) * 100;
    sprite.rotation = body.getAngle();
  }
}
