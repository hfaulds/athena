export class Key {
  public isDown: boolean = false;
  public isUp: boolean = true;

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

export class LocalInput {
  private readonly left = Key.listen(65); // a
  private readonly up = Key.listen(87); // w
  private readonly right = Key.listen(68); // d
  private readonly down = Key.listen(83); // s

  public gatherInputs() {
    return([
      {
        left: this.left,
        up: this.up,
        right: this.right,
        down: this.down,
      }
    ]);
  }
}

export class LocalSendingInput extends LocalInput {
  constructor(private readonly negotiation) {
    super();
  }

  public gatherInputs() {
    var inputs = super.gatherInputs();
    this.negotiation.sendMessage(inputs);
    return inputs;
  }
}

export class RemoteInput {
  constructor(private readonly inputs: Array<Input>) { }

  public gatherInputs() {
    var inputs = Array.from(this.inputs);
    this.inputs.length = 0;
    return inputs;
  }

  static listen(negotiation) {
    var inputs = [];
    negotiation.on('receiveMessage', function(remoteInputs) {
      remoteInputs.forEach(function(input) {
        inputs.push(input);
      });
    });
    return new RemoteInput(inputs);
  }
}
