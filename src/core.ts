import * as PIXI from 'pixi.js'
import { Vec2 } from 'planck-js'

import World from './World'

export default class Core {
  private currentTime: number;

  constructor(
    private stage: PIXI.Container,
    private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer,
    private world: World,
  ) {}

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

  public tick() {
    requestAnimationFrame(this.tick.bind(this));

    var newTime = window.performance.now();
    var frameTime = (newTime - this.currentTime) / 1000;
    this.currentTime = newTime;

    while (frameTime > 0) {
      var deltaTime = Math.min(frameTime, 1 /60);

      this.world.tick(deltaTime);

      frameTime -= deltaTime;
    }
    this.renderer.resize(window.innerWidth, window.innerHeight);
    this.world.render();
    this.renderer.render(this.stage);
  }
}
