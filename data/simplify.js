var simplify = require('simplify-geometry');
var planck = require('planck-js');
var assets = require('./meshes.json');

function findCenter(mesh) {
  var path = [];

  for (var i = 0; i < mesh.length; i++) {
    path.push(planck.Vec2(mesh[i][0], mesh[i][1]));
  }
  var centroid = planck.Polygon(path).m_centroid;
  return [centroid.x, centroid.y];
}

function centerMesh(mesh) {
  var newMesh = simplify(mesh, 5);
  var center = findCenter(newMesh);

  return newMesh.map(function(p) {
    return [(p[0] - center[0]) / 100, (p[1] - center[1]) / 100];
  });
}

var newAssets = {
  meteors: {},
  ships: {},
};
for (var i = 0; i < Object.keys(assets.meteors).length; i++) {
  var key = Object.keys(assets.meteors)[i];
  var meteor = assets.meteors[key];
  newAssets.meteors[key] = {
    mesh: centerMesh(meteor.mesh),
    textures: meteor.textures
  }
}

var shipMesh = centerMesh(assets.ships.playerShip1.mesh)
newAssets.ships.playerShip1 = {
  mesh: shipMesh,
  texture: assets.ships.playerShip1.texture
}

console.log(JSON.stringify(newAssets));
