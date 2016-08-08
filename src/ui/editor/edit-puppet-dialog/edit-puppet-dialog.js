/** Dranimate Browser UI - Edit Puppet Dialog
 *
 * TODO: DOCUMENT
 */

(function() {

var edPupDogMod = angular.module('dran.editor.edit-puppet-dialog', [
  'ngMaterial',
  'dran.model',
  'dran.image-to-mesh'
]);

EditPuppetDialogCtrl.$inject = [ '$scope', '$mdDialog', 'imageToMesh' ];
function EditPuppetDialogCtrl($scope, $mdDialog, imageToMesh) {
  var $ctrl = this;

  // dummy model for threshold. TODO: hook it up yo!
  $ctrl.threshold = 25;

  /* initializing the controller */
  $ctrl.editMode = imageToMesh.getAddControlPoints() ? 'editCtrlPt' : 'cropImg';
  $ctrl.selectMode = imageToMesh.getAddPixels() ? 'select' : 'remove';

  /* updating imageToMesh through the controller */
  $scope.$watch(function() { return $ctrl.editMode; },
    function(newVal, oldVal) {
      switch(newVal) {
        case 'editCtrlPt':
          imageToMesh.setAddControlPoints(true);
          break;
        case 'cropImg':
          imageToMesh.setAddControlPoints(false);
          break;
      };
  });
  $scope.$watch(function() { return $ctrl.selectMode; },
    function(newVal, oldVal) {
      switch(newVal) {
        case 'select':
          imageToMesh.setAddPixels(true);
          break;
        case 'remove':
          imageToMesh.setAddPixels(false);
          break;
      }
  });

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
edPupDogMod.directive('dranImageToMeshContainer', [
    'model',
    'imageToMesh',
  function(model, imageToMesh) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        imageToMesh.setup(element[0]);
        imageToMesh.editImage(model.getSelectedPuppet().image.src);
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
