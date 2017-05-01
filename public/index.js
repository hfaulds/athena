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
  .add("images/cat.png")
  .load(setup);

var cat = undefined;

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

  //Create the `cat` sprite
  cat = new PIXI.Sprite(
    PIXI.loader.resources["images/cat.png"].texture
  );
  cat.y = 96;
  cat.vx = 0;
  cat.vy = 0;
  stage.addChild(cat);

  //Capture the keyboard arrow keys
  var left = keyboard(37),
      up = keyboard(38),
      right = keyboard(39),
      down = keyboard(40);

  //Left arrow key `press` method
  left.press = function() {

    //Change the cat's velocity when the key is pressed
    cat.vx = -5;
    cat.vy = 0;
  };

  //Left arrow key `release` method
  left.release = function() {

    //If the left arrow has been released, and the right arrow isn't down,
    //and the cat isn't moving vertically:
    //Stop the cat
    if (!right.isDown && cat.vy === 0) {
      cat.vx = 0;
    }
  };

  //Up
  up.press = function() {
    cat.vy = -5;
    cat.vx = 0;
  };
  up.release = function() {
    if (!down.isDown && cat.vx === 0) {
      cat.vy = 0;
    }
  };

  //Right
  right.press = function() {
    cat.vx = 5;
    cat.vy = 0;
  };
  right.release = function() {
    if (!left.isDown && cat.vy === 0) {
      cat.vx = 0;
    }
  };

  //Down
  down.press = function() {
    cat.vy = 5;
    cat.vx = 0;
  };
  down.release = function() {
    if (!up.isDown && cat.vx === 0) {
      cat.vy = 0;
    }
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

  //Use the cat's velocity to make it move
  cat.x += cat.vx;
  cat.y += cat.vy
}
