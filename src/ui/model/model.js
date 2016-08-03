/** Dranimate Browser UI - Model
 * Angular service wrapping the Dranimate object.
 */

(function() {

var modelMod = angular.module('dran.model', [ ])

modelMod.factory('model', function() {
  return new Dranimate();
});

})();
