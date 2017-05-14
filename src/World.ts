import { Vec2, World } from 'planck-js'
import * as PIXI from 'pixi.js'

import Asteroid from './entities/Asteroid'
import Background from './entities/Background'
import Ship from './entities/Ship'
import EntityLoader from './EntityLoader'
import rand from './util/rand'
import RenderRelativeTo from './components/RenderRelativeTo'
import RenderAtScreenCenter from './components/RenderAtScreenCenter'
import KeyboardInput from './components/KeyboardInput'
import { LocalInput, LocalSendingInput, RemoteInput } from './input/LocalInput'

export default class MyWorld {
  constructor(
    private readonly background: Background,
    private readonly entities,
    private readonly focusGuid,
    private readonly world,
  ) { }

  static create(assets) {
    var world = new World();
    var playerShip = Ship.create(
      assets,
      -315,
      [new RenderAtScreenCenter(), new KeyboardInput(new LocalInput())],
      Vec2(-10, -10),
      world
    );
    var background = Background.create(playerShip);
    var focusGuid = playerShip.guid;

    var entities = {};
    entities[playerShip.guid] = playerShip;
    var asteroidRenderer = new RenderRelativeTo(playerShip);
    for(var x = -10; x < 10; x=x+2) {
      for(var y = -10; y < 10; y=y+2) {
        if (! (Math.abs(x) == 10 && Math.abs(y) == 10) ) {
          x = x + rand(1.9);
          y = y + rand(1.9);
          var position = Vec2(x, y);
          var asteroid = Asteroid.createRandom(
            assets,
            [asteroidRenderer],
            position,
            world,
          );
          entities[asteroid.guid] = asteroid;
        }
      }
    }

    return new MyWorld(background, entities, playerShip.guid, world);
  }

  static fromSnapshot(assets, negotiation, snapshot): MyWorld {
    var world = new World();
    var focusGuid = snapshot.focusGuid;

    var focusSnapshot = snapshot.entities.find(function(entitySnapshot) { return entitySnapshot.guid == focusGuid });
    var focusComponents = [new RenderAtScreenCenter(), new KeyboardInput(new LocalSendingInput(negotiation))];
    var focusEntity = EntityLoader.loadSnapshot(
      focusSnapshot,
      assets,
      focusComponents,
      world
    );
    var entities = {};
    entities[focusGuid] = focusEntity;

    var background = Background.create(focusEntity);

    var components = [new RenderRelativeTo(focusEntity)];
    snapshot.entities.forEach(function(entitySnapshot) {
      if (entitySnapshot !== focusSnapshot) {
        var entity = EntityLoader.loadSnapshot(
          entitySnapshot,
          assets,
          components,
          world,
        );
        entities[entity.guid] = entity;
      }
    }, this);
    return new MyWorld(background, entities, focusGuid, world);
  }

  public addToStage(stage) {
    this.background.addToStage(stage);
    Object.values(this.entities).forEach(function(a) {
      a.addToStage(stage)
    });
  }

  public createSnapshot(focusGuid) {
    var entities = Object.values(this.entities).map(function(entity) {
      return entity.createSnapshot();
    });
    return({
      focusGuid: focusGuid,
      entities: entities,
    })
  }

  public updateFromSnapshot(snapshot) {
    snapshot.entities.forEach(function(entitySnapshot) {
      this.entities[entitySnapshot.guid].updateFromSnapshot(entitySnapshot);
    }.bind(this));
  }

  public createPlayer(assets, position: Vec2, negotiation) {
    var ship = Ship.create(
      assets,
      135,
      [new RenderRelativeTo(this.getFocus()), new KeyboardInput(RemoteInput.listen(negotiation))],
      position,
      this.world
    );
    this.entities[ship.guid] = ship;
    return ship;
  }

  public getFocus() {
    return this.findEntity(this.focusGuid);
  }

  public findEntity(index: number) {
    return this.entities[index];
  }

  public tick(deltaTime) {
    Object.values(this.entities).forEach(function(a) {
      a.tick()
    });
    this.world.step(deltaTime);
  }

  public render() {
    Object.values(this.entities).forEach(function(a) {
      a.render()
    });
    this.background.render();
  }
}
