/** Dranimate Browser UI - Edit Puppet Dialog
 */

(function() {

var edPupDogMod = angular.module('dran.editor.edit-puppet-dialog', [
  'ngMaterial'
]);

EditPuppetDialogCtrl.$inject = [ ]
function EditPuppetDialogCtrl() {
  var ctrl = this;

  // TODO: attach to the actual canvas yo!
  ctrl.zoomIn = function() { console.log("edit pup zoom in"); };
  ctrl.zoomOut = function() { console.log("edit pup zoom out"); };
  ctrl.panEnabled = false;
}

// TODO: put $mdDialog in scope somehow
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
