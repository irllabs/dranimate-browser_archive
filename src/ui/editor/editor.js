/** Dranimate Browser UI - Editor
 *
 * Module Name: 'dran.editor'
 * Directive Name: <dran-editor>
 *
 * It's the editor!
 *
 * Note: currently (is supposed to) contain input for editing puppet name
 * in the left sidenav (pupdash-container). Move this to the sidenav?
 *   The reason why it's here is because it makes closing sidenav easier.
 *   But maybe we could get around that using directive attributes.
 */

angular.module('dran.editor', [
    'ngMaterial',
    'dran.editor.puppetDashboard',
    'dran.editor.zoompanner',
    'dran.model'
  ])

  .directive('dranThreeContainer', ['model', function(model) {
    return {
      restrict: 'AE',
      template: '<div></div>',
      scope: { },
      link: function(scope, element) {
        /* element[0] gets the raw DOM reference from the jqlite object */
        model.setup(element[0]);
      }
    };
  }])

  .directive('dranEditor', function() {
    return {
      restrict: 'AE',
      templateUrl: 'src/ui/editor/editor.html',
      scope: { },
      controller: ['$scope', '$mdSidenav', '$mdMedia', function($scope, $mdSidenav, $mdMedia) {
        $scope.togglePupdashContainer = function() {
          $mdSidenav('pupdash-container').toggle();
        };

        $scope.getPupdashContainerDepth = function() {
          return $mdMedia('gt-sm') ? 2 : 4;
        };
      }]
    };
  });
