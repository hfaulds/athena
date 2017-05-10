import * as PIXI from 'pixi.js'
import { Vec2, World } from 'planck-js'

import RenderRelativeTo from './components/RenderRelativeTo'
import RenderAtScreenCenter from './components/RenderAtScreenCenter'
import KeyboardInput from './components/KeyboardInput'
import Entity from './entities/Entity'
import Asteroid from './entities/Asteroid'
import Background from './entities/Background'
import Ship from './entities/Ship'
import rand from './util/rand'

export default class Core {
  readonly entities: Array<Entity> = [];

  private currentTime: number;

  constructor(private stage: PIXI.Container,
    private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer,
    private world) {}

  static create() {
    var stage = new PIXI.Container(),
      renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight),
      world = World();

    document.body.appendChild(renderer.view);
    renderer.view.style.position = "absolute";
    renderer.view.style.display = "block";
    renderer.autoResize = true;
    return new Core(stage, renderer, world);
  }

  public start() {
    fetch('/assets.json').then(function(res) {
      return res.json();
    }).then(function(assets) {
      PIXI.loader
        .add("images/sheet.json")
        .add("images/purple.png")
        .load(function() {
          this.setup(assets);
          this.currentTime = window.performance.now();
          this.tick();
        }.bind(this));
    }.bind(this));
  }

  private setup(assets) {
    var playerShip = Ship.create(
      assets,
      -315,
      [new RenderAtScreenCenter(), new KeyboardInput()],
      Vec2(-10, -10),
      this.world
    );
    var ship = Ship.create(
      assets,
      135,
      [new RenderRelativeTo(playerShip)],
      Vec2(10, 10),
      this.world
    );
    var background = Background.create(playerShip);
    background.addToStage(this.stage);
    playerShip.addToStage(this.stage);
    ship.addToStage(this.stage);

    this.entities.push(background);
    this.entities.push(playerShip);
    this.entities.push(ship);

    var asteroidRenderer = new RenderRelativeTo(playerShip);
    for(var x = -10; x < 10; x=x+2) {
      for(var y = -10; y < 10; y=y+2) {
        if (! (Math.abs(x) == 10 && Math.abs(y) == 10) ) {
          x = x + rand(1.9);
          y = y + rand(1.9);
          var position = Vec2(x, y);
          var asteroid = Asteroid.createRandom(
            assets,
            [asteroidRenderer],
            position,
            this.world,
          );
          asteroid.addToStage(this.stage);
          this.entities.push(asteroid);
        }
      }
    }
  }

  private tick() {
    requestAnimationFrame(this.tick.bind(this));

    var newTime = window.performance.now();
    var frameTime = (newTime - this.currentTime) / 1000;
    this.currentTime = newTime;

    while (frameTime > 0) {
      var deltaTime = Math.min(frameTime, 1 /60);

      this.entities.forEach(function(a) { a.tick() });
      this.world.step(deltaTime);
      this.entities.forEach(function(a) { a.render() });

      frameTime -= deltaTime;
    }

    this.renderer.resize(window.innerWidth, window.innerHeight);
    this.renderer.render(this.stage);
  }
}
