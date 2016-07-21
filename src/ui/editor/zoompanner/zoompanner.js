/** Dranimate Browser UI - Editor - Zoompanner
 *
 * Module Name: 'dran.editor.zoompanner'
 * Directive Name: <dran-zoompanner>
 *
 * Attributes: (TODO implement!)
 *   zoominClick = function to call when zoom in is pressed
 *   zoomoutClick = function to call when zoom out is pressed
 *   panToggle = assignable related to pan button
 */

angular.module('dran.editor.zoompanner', ['ngMaterial'])
  .directive('dranZoompanner', function() {
    return {
      restrict: 'AE',
      templateUrl: 'src/ui/editor/zoompanner/zoompanner.html',
      scope: { },
      controller: ['$scope', function($scope) {
        // TODO: this is here as a placeholder,
        // eventually you'll hook up models to these things
        $scope.zoominClick = function(ev) { console.log("zoom in!"); };
        $scope.zoomoutClick = function(ev) { console.log("zoom out!"); };
        $scope.panToggle = false;

        $scope.panToggled = function(ev) {
          $scope.panToggle = !$scope.panToggle;
        }
      }]
    };
  });
