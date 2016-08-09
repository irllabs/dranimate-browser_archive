/** Dranimate Browser UI - Image to Mesh Object
 */

window.imageToMesh = new ImageToMesh(); // for debug. comment out for prod!

(function() {

var imgToMeshMod = angular.module('dran.image-to-mesh', [ ]);

imgToMeshMod.factory('imageToMesh', function() {
  var imageToMesh = window.imageToMesh; // for debug. comment out for prod!
  // var imageToMesh = new imageToMesh(); // uncomment for production!
  return imageToMesh;
});

})();
