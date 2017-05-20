import * as PIXI from 'pixi.js'
import { Vec2, Polygon } from 'planck-js'

var resources = PIXI.loader.resources;

function createGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
}

export default abstract class Entity {
  private sprite: PIXI.Sprite;
  private body: Body;

  constructor(
    assets,
    world,
    private readonly bodyAttributes,
    private readonly components: Array<Component>,
    private readonly fixtureAttributes,
    private readonly textureName: string,
    public guid = createGuid(),
  ) {
    this.sprite = new PIXI.Sprite(
      resources["images/sheet.json"].textures[textureName]
    );
    this.sprite.pivot = Vec2({
      x: this.sprite.width / 2,
      y: this.sprite.height / 2,
    });

    this.body = world.createBody(bodyAttributes);

    var mesh = assets["meshes"]["playerShip1"];
    var polygon = Polygon(mesh.map(function(p) {
      return Vec2(p[0], p[1]);
    }));
    this.body.createFixture(polygon, fixtureAttributes);
  }

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

  public getSprite() {
    return this.sprite;
  }

  public getBody() {
    return this.body;
  }

  public createSnapshot() {
    var bodyAttributes = {
      angle: this.body.getAngle(),
      position: this.getPosition(),
      velocity: this.body.getLinearVelocity(),
      angularDamping: this.body.getAngularDamping(),
      linearDamping: this.body.getLinearDamping(),
    };

    return {
      type: this.constructor.name,
      guid: this.guid,
      bodyAttributes: bodyAttributes,
      fixtureAttributes: this.fixtureAttributes,
      textureName: this.textureName
    };
  }

  public updateFromSnapshot(snapshot) {
    var bodyAttributes = snapshot.bodyAttributes;
    this.body.setAngle(bodyAttributes.angle);
    this.body.setPosition(bodyAttributes.position);
    this.body.setLinearVelocity(bodyAttributes.velocity);
  }
}
