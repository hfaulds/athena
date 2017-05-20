import * as PIXI from 'pixi.js'
import { Vec2 } from 'planck-js'
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import World from './World'
import Entity from './entities/Entity'

export default class Core extends EventEmitter {
  private currentTime: number;
  private lastUpdateTime: number = 0;

  constructor(
    private stage: PIXI.Container,
    private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer,
    private world: World,
  ) {
    super();
  }

  static create(world: World) {
    var stage = new PIXI.Container(),
      renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.view);
    renderer.view.style.position = "absolute";
    renderer.view.style.display = "block";
    renderer.autoResize = true;

    world.addToStage(stage);

    return new Core(stage, renderer, world);
  }

  public addToStage(entity: Entity) {
    this.stage.addChild(entity.getSprite());
  }

  public removeEntity(entity) {
    this.world.removeEntity(this.stage, entity);
  }

  public tick() {
    requestAnimationFrame(this.tick.bind(this));

    var newTime = window.performance.now();
    var frameTime = (newTime - this.currentTime) / 1000;
    this.currentTime = newTime;

    while (frameTime > 0) {
      var deltaTime = Math.min(frameTime, 1 / 60);

      this.world.tick(deltaTime);

      frameTime -= deltaTime;
    }
    if (this.currentTime - this.lastUpdateTime >= 30) {
      this.lastUpdateTime = this.currentTime;
      this.emit('tick');
    }
    this.renderer.resize(window.innerWidth, window.innerHeight);
    this.world.render();
    this.renderer.render(this.stage);
  }
}
