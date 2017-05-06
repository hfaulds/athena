import * as PIXI from 'pixi.js'
import * as pl from 'planck-js'

var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Texture = PIXI.Texture,
    Sprite = PIXI.Sprite;

var Vec2 = pl.Vec2;

var SHIP = 2;
var ASTEROID = 4;

var Assets = {};

var entities = [];
var world = pl.World();
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

class Key {
  public isDown = false;
  public isUp = true;

  constructor(public code) {};

  static listen(code) {
    let key = new Key(code);
    window.addEventListener(
      "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
      "keyup", key.upHandler.bind(key), false
    );
    return key;
  }

  public downHandler(event) {
    if (event.keyCode === this.code) {
      this.isDown = true;
      this.isUp = false;
    }
    event.preventDefault();
  };

  public upHandler(event) {
    if (event.keyCode === this.code) {
      this.isDown = false;
      this.isUp = true;
    }
    event.preventDefault();
  };
};


var Keyboard ={
  left: Key.listen(65), // a
  up: Key.listen(87), // w
  right: Key.listen(68), // d
  down: Key.listen(83), // s
};

class RenderRelativeTo {
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

class RenderAtScreenCenter {
  public tick() {}

  public render(body, sprite) {
    sprite.x = window.innerWidth / 2;
    sprite.y = window.innerHeight / 2;
    sprite.rotation = body.getAngle();
  };
}

class KeyboardInput {
  public tick(body) {
    // Set velocities
    if (Keyboard.left.isDown && Keyboard.right.isUp) {
      body.applyAngularImpulse(0.1, true);
    } else if (Keyboard.right.isDown && Keyboard.left.isUp) {
      body.applyAngularImpulse(-0.1, true);
    }

    // Thrust: add some force in the ship direction
    if (Keyboard.up.isDown && Keyboard.down.isUp) {
      var f = body.getWorldVector(Vec2(0.0, 1.0));
      var p = body.getWorldPoint(Vec2(0.0, 2.0));
      body.applyLinearImpulse(f, p, true);
    } else if (Keyboard.down.isDown && Keyboard.up.isUp) {
      var f = body.getWorldVector(Vec2(0.0, -0.2));
      var p = body.getWorldPoint(Vec2(0.0, 2.0));
      body.applyLinearImpulse(f, p, true);
    }
  }

  render() {}
}

class Ship {
  readonly body;
  readonly components;
  readonly sprite;

  constructor(body, components, sprite) {
    this.body = body;
    this.components = components;
    this.sprite = sprite;
  }

  static create(angle, components, position, world) {
    var sprite = new PIXI.Sprite(
      resources["images/sheet.json"].textures[
        Assets["ships"]["playerShip1"].texture
      ]
    );
    sprite.pivot = {
      x: sprite.width / 2,
      y: sprite.height / 2,
    }

    var body = world.createBody({
      type : 'dynamic',
      angularDamping : 2.0,
      linearDamping : 0.5,
      position : position,
      angle : angle,
    });

    var shipMesh = Assets["ships"]["playerShip1"].mesh;
    var path = [];

    for (var i = 0; i < shipMesh.length; i++) {
      path.push(Vec2(shipMesh[i][0], shipMesh[i][1]));
    }

    body.createFixture(pl.Polygon(path), {
      density: 100,
    });

    return new Ship(body, components, sprite);
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
}

class Background {
  readonly sprite;
  readonly source;

  constructor(sprite, source) {
    this.sprite = sprite
    this.source = source
  }

  static create(source) {
    var sprite = new PIXI.extras.TilingSprite(
      resources["images/purple.png"].texture
    );
    return new Background(sprite, source);
  }

  public tick() {}

  public render() {
    this.sprite.width = window.innerWidth;
    this.sprite.height = window.innerHeight;
    this.sprite.tilePosition.x = this.source.body.getPosition().x * 100;
    this.sprite.tilePosition.y = this.source.body.getPosition().y * 100;
  }
}

class Asteroid {
  readonly body;
  readonly components;
  readonly sprite;

  constructor(body, components, sprite) {
    this.body = body;
    this.components = components;
    this.sprite = sprite;
  }

  static create(components, position, world) {
    var asset = Object.values(Assets["meteors"])[
      Math.floor(Math.random() * Object.keys(Assets["meteors"]).length)
    ];
    var textureName = asset.textures[
      Math.floor(Math.random() * asset.textures.length)
    ];
    var sprite = new PIXI.Sprite(
      resources["images/sheet.json"].textures[textureName]
    );

    sprite.pivot = {
      x: sprite.width / 2,
      y: sprite.height / 2,
    }

    var body = world.createBody({
      type : 'dynamic',
      angularDamping : 5.0,
      position : position,
      linearVelocity : Vec2(rand(0.1), rand(0.1)),
    });

    var path = [];
    for (var i = 0; i < asset.mesh.length; i++) {
      path.push(Vec2(asset.mesh[i][0], asset.mesh[i][1]));
    }
    body.createFixture(pl.Polygon(path), {
      density: 1000,
    });
    return new Asteroid(body, components, sprite);
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
}

function rand(value) {
  return (Math.random() - 0.5) * (value || 1);
}

function setup() {
  var playerShip = Ship.create(
    -315,
    [new RenderAtScreenCenter(), new KeyboardInput()],
    Vec2(-10, -10),
    world
  );
  var ship = Ship.create(
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
        var asteroid = Asteroid.create([asteroidRenderer], position, world);
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
