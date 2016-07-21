/** Dranimate Browser UI - Editor
 *
 * Module Name: 'dran.editor'
 * Directive Name: <dran-editor>
 *
 * It's the editor!
 */

angular.module('dran.editor', [
    'ngMaterial',
    'dran.editor.puppetDashboard',
    'dran.editor.zoompanner'
  ])

  .directive('dranEditor', function() {
    return {
      restrict: 'AE',
      templateUrl: 'src/ui/editor/editor.html',
      scope: { },
      controller: ['$scope', '$mdSidenav', function($scope, $mdSidenav) {
        $scope.togglePupdashContainer = function() {
          $mdSidenav('pupdash-container').toggle();
        };
      }]
    };
  });
