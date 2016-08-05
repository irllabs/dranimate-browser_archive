/** Dranimate Browser UI - Model
 * Angular service wrapping the Dranimate object.
 */

window.dranimate = new Dranimate(); // for debug. comment out for production!

(function() {

var modelMod = angular.module('dran.model', [ ])

modelMod.factory('model', function() {
  return window.dranimate; // for debug. comment out for production!
  //return new Dranimate(); // uncomment for production
});

})();
