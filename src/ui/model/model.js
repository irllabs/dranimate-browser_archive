/** Dranimate Browser UI - Model
 * Angular service wrapping the Dranimate object.
 */

window.dranimate = new Dranimate(); // for debug. comment out for production!

(function() {

var modelMod = angular.module('dran.model', [ ]);

modelMod.factory('model', ['$rootScope', function($rootScope) {
  var dranimate = window.dranimate; // for debug. comment out for production!
  // var dranimate = new Dranimate(); // uncomment for production!
  dranimate.onChange(function() { $rootScope.$digest(); });
  return dranimate;
}]);

})();
