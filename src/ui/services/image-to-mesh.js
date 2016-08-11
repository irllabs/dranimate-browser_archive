/** Dranimate Browser UI - Image to Mesh Object
 *
 * Wraps imageToMesh object in AngularJS service.
 * Allows Angular modules to be explicit about when they need to use it.
 */

window.imageToMesh = new ImageToMesh(); // for debug. comment out for prod!

(function() {

var imgToMeshMod = angular.module('dran.image-to-mesh', [ ]);

imgToMeshMod.factory('imageToMesh', ['$rootScope', function($rootScope) {
  var imageToMesh = window.imageToMesh; // for debug. comment out for prod!
  // var imageToMesh = new imageToMesh(); // uncomment for production!
  imageToMesh.onChange(function() {
    /* $evalAsync forces a digest (i.e. angular update) cycle
     * when called while one isn't already happening.
     * Allows view to update from the model.
     */
    $rootScope.$evalAsync(function() { });
  });
  return imageToMesh;
}]);

})();
