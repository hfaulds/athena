var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Texture = PIXI.Texture,
    Sprite = PIXI.Sprite;

var pl = planck,
    Vec2 = pl.Vec2;

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

var Keyboard ={
  left: keyboard(65), // a
  up: keyboard(87), // w
  right: keyboard(68), // d
  down: keyboard(83), // s
};

function RenderRelativeTo(source) {
  this.source = source
}
RenderRelativeTo.prototype.tick = function() {};
RenderRelativeTo.prototype.render = function(body, sprite) {
  sprite.x = this.source.sprite.x - (body.getPosition().x - this.source.body.getPosition().x) * 100;
  sprite.y = this.source.sprite.y - (body.getPosition().y - this.source.body.getPosition().y) * 100;
  sprite.rotation = body.getAngle();
};

function RenderAtScreenCenter() {}
RenderAtScreenCenter.prototype.tick = function() {};
RenderAtScreenCenter.prototype.render = function(body, sprite) {
  sprite.x = window.innerWidth / 2;
  sprite.y = window.innerHeight / 2;
  sprite.rotation = body.getAngle();
};

function KeyboardInput() {}
KeyboardInput.prototype.tick = function(body) {
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
};
KeyboardInput.prototype.render = function() {};

function Ship(body, components, sprite) {
  this.body = body;
  this.components = components;
  this.sprite = sprite;
}

Ship.create = function(angle, components, position, world) {
  var sprite = new PIXI.Sprite(
    resources["images/sheet.json"].textures[
    Assets.ships.playerShip1.texture
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

  var shipMesh = Assets.ships.playerShip1.mesh;
  var path = [];

  for (var i = 0; i < shipMesh.length; i++) {
    path.push(Vec2(shipMesh[i][0], shipMesh[i][1]));
  }

  body.createFixture(pl.Polygon(path), {
    density: 100,
  });
  return new Ship(body, components, sprite);
};

Ship.prototype.tick = function() {
  this.components.forEach(function(c) {
    c.tick(this.body);
  }.bind(this));
};

Ship.prototype.render = function() {
  this.components.forEach(function(c) {
    c.render(this.body, this.sprite);
  }.bind(this));
};

function Background(sprite, source) {
  this.sprite = sprite
  this.source = source
}
Background.create = function(source) {
  sprite = new PIXI.extras.TilingSprite(
    resources["images/purple.png"].texture
  );
  return new Background(sprite, source);
}
Background.prototype.tick = function() {};
Background.prototype.render = function() {
  this.sprite.width = window.innerWidth;
  this.sprite.height = window.innerHeight;
  this.sprite.tilePosition.x = this.source.body.getPosition().x * 100;
  this.sprite.tilePosition.y = this.source.body.getPosition().y * 100;
};

function Asteroid(body, components, sprite) {
  this.body = body;
  this.components = components;
  this.sprite = sprite;
}
Asteroid.create = function(components, position, world) {
  var asset = Object.values(Assets.meteors)[
    Math.floor(Math.random() * Object.keys(Assets.meteors).length)
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
};

Asteroid.prototype.tick = function() {
  this.components.forEach(function(c) {
    c.tick(this.body);
  }.bind(this));
};

Asteroid.prototype.render = function() {
  this.components.forEach(function(c) {
    c.render(this.body, this.sprite);
  }.bind(this));
};

function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  //The `downHandler`
  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  //The `upHandler`
  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  //Attach event listeners
  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}

function rand(value) {
  return (Math.random() - 0.5) * (value || 1);
}

function setup() {
  var ship = Ship.create(
    -45,
    [new RenderAtScreenCenter(), new KeyboardInput()],
    Vec2(-10, -10),
    world
  );
  var background = Background.create(ship);
  stage.addChild(background.sprite);
  entities.push(background);
  stage.addChild(ship.sprite);
  entities.push(ship);


  var asteroidRenderer = new RenderRelativeTo(ship);
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
