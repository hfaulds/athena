var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Texture = PIXI.Texture,
    Sprite = PIXI.Sprite;

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

var ship = undefined;

function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  //The `upHandler`
  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
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
  var background = new PIXI.TilingSprite(
    resources["images/purple.png"].texture,
    renderer.width,
    renderer.height
  );
  stage.addChild(background);

  ship = new PIXI.Sprite(
    resources["images/sheet.json"].textures["playerShip1_red.png"]
  );
  ship.y = 96;
  ship.vx = 0;
  ship.vy = 0;
  ship.ax = 0;
  ship.ay = 0;
  stage.addChild(ship);

  //Capture the keyboard arrow keys
  var left = keyboard(37),
      up = keyboard(38),
      right = keyboard(39),
      down = keyboard(40);

  left.press = function() {
    ship.ax = -0.05;
  };
  left.release = function() {
    ship.ax = 0;
  };
  up.press = function() {
    ship.ay = -0.05;
  };
  up.release = function() {
    ship.ay = 0;
  };
  right.press = function() {
    ship.ax = 0.05;
  };
  right.release = function() {
    ship.ax = 0;
  };
  down.press = function() {
    ship.ay = 0.05;
  };
  down.release = function() {
    ship.ay = 0;
  };

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
  ship.vx += ship.ax;
  ship.vy += ship.ay;
  ship.x += ship.vx;
  ship.y += ship.vy;
  ship.x = ship.x % window.innerWidth;
  ship.y = ship.y % window.innerHeight;
}
