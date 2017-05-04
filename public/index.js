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
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  ax: 0,
  ay: 0,
  tick: function() {
    // Set velocities
    if (Keyboard.left.isDown && Keyboard.right.isUp) {
      this.body.applyAngularImpulse(-0.1, true);
    } else if (Keyboard.right.isDown && Keyboard.left.isUp) {
      this.body.applyAngularImpulse(0.1, true);
    }

    // Thrust: add some force in the ship direction
    if (Keyboard.up.isDown) {
      var f = this.body.getWorldVector(Vec2(0.0, 1.0));
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
  background.render();

  renderer.resize(window.innerWidth, window.innerHeight);
}
