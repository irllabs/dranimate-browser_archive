/** Dranimate Browser UI - Edit Puppet Dialog
 *
 * TODO: DOCUMENT
 */

(function() {

var edPupDogMod = angular.module('dran.editor.edit-puppet-dialog', [
  'ngMaterial'
]);

EditPuppetDialogCtrl.$inject = [ '$mdDialog' ]
function EditPuppetDialogCtrl($mdDialog) {
  var $ctrl = this;

  $ctrl.state = {
    mode: 'cropImg',
    cropmode: 'select',
    threshold: 25
  }

  $ctrl.close = function(ev) {
    $mdDialog.hide();
  }

  // TODO: attach to the actual canvas yo!
  $ctrl.zoomIn = function() { console.log("edit pup zoom in"); };
  $ctrl.zoomOut = function() { console.log("edit pup zoom out"); };
  $ctrl.panEnabled = false;
}

edPupDogMod.directive('dranOpenEditPuppetDialog', ["$mdDialog", function($mdDialog) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      element.bind('click', function(ev) {
        $mdDialog.show({
          controller: EditPuppetDialogCtrl,
          controllerAs: '$ctrl',
          templateUrl: 'src/ui/editor/edit-puppet-dialog/edit-puppet-dialog.html',
          parent: angular.element(document.body),
          closeTo: element,
          fullscreen: false // TODO: make fullscreen on smaller windows
        });
      });
    }
  };
}]);

})();
