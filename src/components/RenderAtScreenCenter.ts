export default class RenderAtScreenCenter {
  public tick() {}

  public render(body, sprite) {
    sprite.x = window.innerWidth / 2;
    sprite.y = window.innerHeight / 2;
    sprite.rotation = body.getAngle();
  };
}
