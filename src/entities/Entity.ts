export default abstract class Entity {
  constructor(
    protected readonly body: Body,
    protected readonly components: Array<Component>,
    protected readonly sprite: PIXI.Sprite
  ) { }

  public tick() {
    this.components.forEach(function(c) {
      c.tick(this.body);
    }.bind(this));
  }

  public render() {
    this.components.forEach(function(c) {
      c.render(this.body, this.sprite);
    }.bind(this));
  }

  public getPosition(): Vec2 {
    return this.body.getPosition();
  }

  public getScreenPosition(): Vec2 {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  public addToStage(stage: PIXI.Container) {
    stage.addChild(this.sprite);
  }
}
