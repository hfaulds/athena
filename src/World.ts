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
      Vec2(-5, -5),
      world
    );
    var background = Background.create(playerShip);
    var focusGuid = playerShip.guid;

    var entities = {};
    entities[playerShip.guid] = playerShip;
    var asteroidRenderer = new RenderRelativeTo(playerShip);
    for(var x = -5; x < 5; x=x+2) {
      for(var y = -5; y < 5; y=y+2) {
        if (! (Math.abs(x) == 5 && Math.abs(y) == 5) ) {
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
    stage.addChild(this.background.getSprite());
    Object.values(this.entities).forEach(function(e) {
      stage.addChild(e.getSprite());
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

  public updateFromSnapshot(assets, snapshot) {
    var validGuids = new Set();
    var newEntities = [];
    snapshot.entities.forEach(function(entitySnapshot) {
      validGuids.add(entitySnapshot.guid);
      var entity = this.entities[entitySnapshot.guid];
      if (entity) {
        entity.updateFromSnapshot(entitySnapshot);
      } else {
        var focusEntity = this.getFocus();
        entity = EntityLoader.loadSnapshot(
          entitySnapshot,
          assets,
          [new RenderRelativeTo(focusEntity)],
          this.world,
        );
        this.entities[entity.guid] = entity;
        newEntities.push(entity);
      }
    }.bind(this));

    var removedEntities = [];
    Object.values(this.entities).forEach(function(entity) {
      if (!validGuids.has(entity.guid)) {
        removedEntities.push(entity);
        delete this.entities[entity.guid];
      }
    }.bind(this));

    return({
      added: newEntities,
      removed: removedEntities,
    });
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

  public removeEntity(stage, entity) {
    this.world.destroyBody(entity.getBody());
    stage.removeChild(entity.getSprite());
    delete this.entities[entity.guid];
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
