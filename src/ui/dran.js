/** Dranimate Browser UI
 *
 * Module Name: 'dran'
 *
 * Will be expanded upon as the modules come together.
 * TODO: move the dran stuff in the index into here! Or it's own directive
 *       (dran-editor?)
 */

(function() {

var dranMod = angular.module('dran', [
  'ngMaterial',
  'dran.editor'
])

dranMod.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('green')
    .accentPalette('orange')
    .warnPalette('red')
});

})();
