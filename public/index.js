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

var Ship = {
  create: function(world) {
    var ship = {
      tick: Ship.tick,
      render: Ship.render,
    };
    ship.sprite = new PIXI.Sprite(
      resources["images/sheet.json"].textures[
        Assets.ships.playerShip1.texture
      ]
    );
    ship.sprite.pivot = {
      x: ship.sprite.width / 2,
      y: ship.sprite.height / 2,
    }

    ship.body = world.createBody({
      type : 'dynamic',
      angularDamping : 2.0,
      linearDamping : 0.5,
      position : Vec2(),
    });

    var shipMesh = Assets.ships.playerShip1.mesh;
    var path = [];

    for (var i = 0; i < shipMesh.length; i++) {
      path.push(Vec2(shipMesh[i][0], shipMesh[i][1]));
    }

    ship.body.createFixture(pl.Polygon(path), {
      density: 100,
    });

    return ship;
  },
  tick: function() {
    // Set velocities
    if (Keyboard.left.isDown && Keyboard.right.isUp) {
      this.body.applyAngularImpulse(0.1, true);
    } else if (Keyboard.right.isDown && Keyboard.left.isUp) {
      this.body.applyAngularImpulse(-0.1, true);
    }

    // Thrust: add some force in the ship direction
    if (Keyboard.up.isDown && Keyboard.down.isUp) {
      var f = this.body.getWorldVector(Vec2(0.0, 1.0));
      var p = this.body.getWorldPoint(Vec2(0.0, 2.0));
      this.body.applyLinearImpulse(f, p, true);
    } else if (Keyboard.down.isDown && Keyboard.up.isUp) {
      var f = this.body.getWorldVector(Vec2(0.0, -0.2));
      var p = this.body.getWorldPoint(Vec2(0.0, 2.0));
      this.body.applyLinearImpulse(f, p, true);
    }
  },
  render: function() {
    this.sprite.x = window.innerWidth / 2;
    this.sprite.y = window.innerHeight / 2;
    this.sprite.rotation = this.body.getAngle();
  }
};

var Background = {
  create: function(player) {
    var background = {
      player: player,
      tick: Background.tick,
      render: Background.render,
    };
    background.sprite = new PIXI.extras.TilingSprite(
      resources["images/purple.png"].texture
    );
    return background;
  },
  tick: function() {},
  render: function() {
    this.sprite.width = window.innerWidth;
    this.sprite.height = window.innerHeight;
    this.sprite.tilePosition.x = this.player.body.getPosition().x * 100;
    this.sprite.tilePosition.y = this.player.body.getPosition().y * 100;
  },
};

var Asteroid = {
  create: function(world, player) {
    var asteroid = {
      player: player,
      render: Asteroid.render,
      tick: Asteroid.tick,
    };
    var asset = Object.values(Assets.meteors)[
      Math.floor(Math.random() * Object.keys(Assets.meteors).length)
    ];
    var textureName = asset.textures[
      Math.floor(Math.random() * asset.textures.length)
    ];
    asteroid.sprite = new PIXI.Sprite(
      resources["images/sheet.json"].textures[textureName]
    );

    asteroid.sprite.pivot = {
      x: asteroid.sprite.width / 2,
      y: asteroid.sprite.height / 2,
    }

    asteroid.body = world.createBody({
      type : 'dynamic',
      angularDamping : 5.0,
      linearDamping : 5.0,
      position : Vec2(rand(10), rand(10)),
    });

    var path = [];
    for (var i = 0; i < asset.mesh.length; i++) {
      path.push(Vec2(asset.mesh[i][0], asset.mesh[i][1]));
    }

    asteroid.body.createFixture(pl.Polygon(path), {
      density: 1000,
    });
    return asteroid;
  },
  tick: function() {},
  render: function() {
    this.sprite.x = this.player.sprite.x - (this.body.getPosition().x - this.player.body.getPosition().x) * 100;
    this.sprite.y = this.player.sprite.y - (this.body.getPosition().y - this.player.body.getPosition().y) * 100;
    this.sprite.rotation = this.body.getAngle();
  }
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
  var ship = Ship.create(world);
  var background = Background.create(ship);
  stage.addChild(background.sprite);
  entities.push(background);
  stage.addChild(ship.sprite);
  entities.push(ship);

  for(var i =0; i < 50; i++) {
    var asteroid = Asteroid.create(world, ship);
    stage.addChild(asteroid.sprite);
    entities.push(asteroid);
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
