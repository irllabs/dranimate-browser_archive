/** Dranimate Browser UI
 *
 * Module Name: 'dran'
 *
 * Provides configuration options for the entire application's UI.
 * Currently only customizes the color scheme. Will more be added later?
 */

(function() {

var dranMod = angular.module('dran', [
  'ngMaterial',
  'dran.editor'
])

dranMod.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('green')
    .accentPalette('amber')
    .warnPalette('red')
});

})();
