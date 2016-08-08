/** Dranimate Browser UI - Edit Puppet Dialog
 *
 * TODO: DOCUMENT
 */

(function() {

var edPupDogMod = angular.module('dran.editor.edit-puppet-dialog', [
  'ngMaterial',
  'dran.image-to-mesh'
]);

EditPuppetDialogCtrl.$inject = [ '$mdDialog', 'imageToMesh' ]
function EditPuppetDialogCtrl($mdDialog, imageToMesh) {
  var $ctrl = this;

  $ctrl.state = {
    mode: 'cropImg',
    cropmode: 'select',
    threshold: 25
  }

  /* zoompanner controls */
  $ctrl.zoomIn = imageToMesh.zoomIn;
  $ctrl.zoomOut = imageToMesh.zoomOut;
  $ctrl.togglePan = function() {
    imageToMesh.setPanEnabled(!imageToMesh.getPanEnabled());
  };
  $ctrl.getPanEnabled = imageToMesh.getPanEnabled;
}

edPupDogMod.directive('dranCloseEditPuppetDialog', ['$mdDialog', function($mdDialog) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      element.bind('click', function(ev) {
        $mdDialog.hide();
      });
    }
  };
}]);

/* attach this directive to canvases only */
edPupDogMod.directive('dranImageToMeshContainer', ['imageToMesh', function(imageToMesh) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      imageToMesh.setup(element[0]);
    }
  };
}]);

edPupDogMod.directive('dranOpenEditPuppetDialog', [
    '$mdMedia',
    '$mdDialog',
  function($mdMedia, $mdDialog) {
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
            fullscreen: $mdMedia('xs')
          });
        });
      }
    };
}]);

})();
