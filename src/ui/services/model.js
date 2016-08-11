/** Dranimate Browser UI - Model
 *
 * Wraps Dranimate model object in AngularJS service.
 * Allows Angular modules to be explicit about when they need to use it.
 */

window.dranimate = new Dranimate(); // for debug. comment out for production!

(function() {

var modelMod = angular.module('dran.model', [ ]);

modelMod.factory('model', ['$rootScope', function($rootScope) {
  var dranimate = window.dranimate; // for debug. comment out for production!
  // var dranimate = new Dranimate(); // uncomment for production!
  dranimate.onChange(function() {
    /* $evalAsync forces a digest (i.e. angular update) cycle
     * when called while one isn't already happening.
     * Allows view to update from the model.
     */
    $rootScope.$evalAsync(function() { });
  });
  return dranimate;
}]);

})();
