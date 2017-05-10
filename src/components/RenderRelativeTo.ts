import Entity from '../entities/Entity'

export default class RenderRelativeTo {
  readonly source: Entity;

  constructor(source) {
    this.source = source
  }

  public tick() {}

  public render(body, sprite) {
    var sourcePosition = this.source.getPosition();
    var sourceScreenPosition = this.source.getScreenPosition();
    var bodyPosition = body.getPosition();

    sprite.x = sourceScreenPosition.x - (
      bodyPosition.x - sourcePosition.x
    ) * 100;
    sprite.y = sourceScreenPosition.y - (
      bodyPosition.y - sourcePosition.y
    ) * 100;
    sprite.rotation = body.getAngle();
  }
}
