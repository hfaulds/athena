export default class Key {
  public isDown = false;
  public isUp = true;

  constructor(public code: number) {};

  static listen(code: number) {
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
