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

var world = pl.World();
var stage = new Container(),
    renderer = autoDetectRenderer(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.view);
renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoResize = true;

//Use Pixi's built-in `loader` object to load an image
PIXI.loader
  .add("images/sheet.json")
  .add("images/purple.png")
  .load(setup);

var Keyboard ={
  left: keyboard(37),
  up: keyboard(38),
  right: keyboard(39),
};

var ship = {
  tick: function() {
    // Set velocities
    if (Keyboard.left.isDown && Keyboard.right.isUp) {
      this.body.applyAngularImpulse(-0.1, true);
    } else if (Keyboard.right.isDown && Keyboard.left.isUp) {
      this.body.applyAngularImpulse(0.1, true);
    }

    // Thrust: add some force in the ship direction
    if (Keyboard.up.isDown) {
      var f = this.body.getWorldVector(Vec2(0.0, 3.0));
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

var background = {
  render: function() {
    this.sprite.width = window.innerWidth;
    this.sprite.height = window.innerHeight;
    this.sprite.tilePosition.x = ship.body.getPosition().x * 100;
    this.sprite.tilePosition.y = ship.body.getPosition().y * 100;
  },
};

var asteroids = [];
var Asteroid = {
  textures: [
    'meteorBrown_big1.png',
    'meteorBrown_big2.png',
    'meteorBrown_big3.png',
    'meteorBrown_big4.png',
    'meteorBrown_med1.png',
    'meteorBrown_med3.png',
    'meteorBrown_small1.png',
    'meteorBrown_small2.png',
    'meteorBrown_tiny1.png',
    'meteorBrown_tiny2.png',
    'meteorGrey_big1.png',
    'meteorGrey_big2.png',
    'meteorGrey_big3.png',
    'meteorGrey_big4.png',
    'meteorGrey_med1.png',
    'meteorGrey_med2.png',
    'meteorGrey_small1.png',
    'meteorGrey_small2.png',
  ],
  create: function(stage, world) {
    var asteroid = {
      render: Asteroid.render,
    };
    var textureName = Asteroid.textures[
      Math.round(Math.random() * Asteroid.textures.length)
    ];
    asteroid.sprite = new PIXI.Sprite(
      resources["images/sheet.json"].textures[textureName]
    );

    asteroid.sprite.pivot = {
      x: asteroid.sprite.width / 2,
      y: asteroid.sprite.height / 2,
    }

    stage.addChild(asteroid.sprite);

    asteroid.body = world.createKinematicBody({
      position : Vec2(2, 2),
      linearVelocity : Vec2(rand(0.3), rand(0.3)),
    });

    var radius = 0.9;
    var n = 8, path = [];
    for (var i = 0; i < n; i++) {
      var a = i * 2 * Math.PI / n;
      var x = radius * (Math.sin(a) + rand(0.3));
      var y = radius * (Math.cos(a) + rand(0.3));
      path.push(Vec2(x, y));
    }

    asteroid.body.createFixture(planck.Polygon(path), {
      filterCategoryBits : ASTEROID,
      filterMaskBits : SHIP
    });
    return asteroid;
  },
  render: function() {
    this.sprite.x = ship.sprite.x - (this.body.getPosition().x - ship.body.getPosition().x) * 100;
    this.sprite.y = ship.sprite.y - (this.body.getPosition().y - ship.body.getPosition().y) * 100;
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
  background.sprite = new PIXI.extras.TilingSprite(
    resources["images/purple.png"].texture
  );
  stage.addChild(background.sprite);

  ship.sprite = new PIXI.Sprite(
    resources["images/sheet.json"].textures["playerShip1_red.png"]
  );
  ship.sprite.pivot = {
    x: ship.sprite.width / 2,
    y: ship.sprite.height / 2,
  }
  stage.addChild(ship.sprite);

  ship.body = world.createBody({
    type : 'dynamic',
    angularDamping : 2.0,
    linearDamping : 0.5,
    position : Vec2(),
  });

  ship.body.createFixture(pl.Polygon([
    Vec2(-0.15, -0.15),
    Vec2(0, -0.1),
    Vec2(0.15, -0.15),
    Vec2(0, 0.2)
  ]), {
    density : 1000,
    filterCategoryBits : SHIP,
    filterMaskBits : ASTEROID
  });

  for(var i =0; i < 30; i++) {
    var asteroid = Asteroid.create(stage, world)
    asteroid.body.setPosition(Vec2(rand(10), rand(10)));
    asteroids.push(asteroid);
  }

  //Set the game state
  state = play;

  //Start the game loop
  gameLoop();
}

function gameLoop() {
  requestAnimationFrame(gameLoop);
  state();
  renderer.render(stage);
}

function play() {
  ship.tick();
  world.step(1 / 60);
  ship.render();
  asteroids.map(function(a) { a.render() });
  background.render();

  renderer.resize(window.innerWidth, window.innerHeight);
}
