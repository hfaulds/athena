import * as PIXI from 'pixi.js'
import { Vec2, World } from 'planck-js'

import RenderRelativeTo from './components/RenderRelativeTo.ts'
import RenderAtScreenCenter from './components/RenderAtScreenCenter.ts'
import KeyboardInput from './components/KeyboardInput.ts'
import Asteroid from './entities/Asteroid.ts'
import Background from './entities/Background.ts'
import Ship from './entities/Ship.ts'
import rand from './util/rand.ts'

var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Texture = PIXI.Texture,
    Sprite = PIXI.Sprite;

var SHIP = 2;
var ASTEROID = 4;

var Assets = {};

var entities = [];
var world = World();
var stage = new Container(),
    renderer = autoDetectRenderer(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.view);
renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoResize = true;

//Use Pixi's built-in `loader` object to load an image
fetch('/assets.json').then(function(res) {
  return res.json();
}).then(function(assets) {
  Assets = assets;
}).then(function() {
  PIXI.loader
    .add("images/sheet.json")
    .add("images/purple.png")
    .load(setup);
});

function setup() {
  var playerShip = Ship.create(
    Assets,
    -315,
    [new RenderAtScreenCenter(), new KeyboardInput()],
    Vec2(-10, -10),
    world
  );
  var ship = Ship.create(
    Assets,
    135,
    [new RenderRelativeTo(playerShip)],
    Vec2(10, 10),
    world
  );
  var background = Background.create(playerShip);

  stage.addChild(background.sprite);
  entities.push(background);
  stage.addChild(playerShip.sprite);
  entities.push(playerShip);
  stage.addChild(ship.sprite);
  entities.push(ship);

  var asteroidRenderer = new RenderRelativeTo(playerShip);
  for(var x = -10; x < 10; x=x+2) {
    for(var y = -10; y < 10; y=y+2) {
      if (! (Math.abs(x) == 10 && Math.abs(y) == 10) ) {
        x = x + rand(1.9);
        y = y + rand(1.9);
        var position = Vec2(x, y);
        var asteroid = Asteroid.create(
          Assets,
          [asteroidRenderer],
          position,
          world,
        );
        stage.addChild(asteroid.sprite);
        entities.push(asteroid);
      }
    }
  }

  gameLoop();
}

function gameLoop() {
  requestAnimationFrame(gameLoop);
  tick();
  renderer.render(stage);
}

function tick() {
  entities.forEach(function(a) { a.tick() });
  world.step(1 / 60);
  entities.forEach(function(a) { a.render() });

  renderer.resize(window.innerWidth, window.innerHeight);
}
