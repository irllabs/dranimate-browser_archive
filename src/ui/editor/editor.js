/** Dranimate Browser UI - Editor
 *
 * Module Name: 'dran.editor'
 *
 * Directive: dran-three-container (Element, Attribute)
 *   Container for the main Dranimate canvas to go into.
 *   TODO: Rename it to something that doesn't couple it to three.js?
 *
 * Directive: dran-toggle-pupdash (Attribute)
 *   Clicking on it will toggle the puppet dashboard open and closed!
 *
 * Component: dran-editor (Element)
 *   The editor!
 *
 * Note: currently (is supposed to) contain input for editing puppet name
 * in the left sidenav (pupdash-container). Move this to the sidenav?
 *   The reason why it's here is because it makes closing sidenav easier.
 *   But maybe we could get around that using directive attributes.
 */

(function() {

var edMod = angular.module('dran.editor', [
  'ngMaterial',
  'dran.editor.puppetDashboard',
  'dran.editor.zoompanner',
  'dran.model'
]);

edMod.directive('dranThreeContainer', ['model', function(model) {
  return {
    restrict: 'AE',
    link: function(scope, element) {
      /* element[0] gets the raw DOM reference from the jqlite object */
      model.setup(element[0]);
    }
  };
}]);

edMod.directive('dranTogglePupdash', ['$mdSidenav', function($mdSidenav) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      element.bind('click', function() {
        $mdSidenav('pupdash-container').toggle();
      });
    }
  };
}]);

edMod.component('dranEditor', { templateUrl: 'src/ui/editor/editor.html' });

})();
