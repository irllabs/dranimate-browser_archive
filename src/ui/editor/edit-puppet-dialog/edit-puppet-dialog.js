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

/* to translate properties from imageToMesh to the controller */
function transEditModeToCtrl(v) { return v ? 'editCtrlPt' : 'cropImg'; };
function transEditModeFromCtrl(v) {
  switch (v) {
    case 'editCtrlPt': return true;
    case 'cropImg': return false;
  };
};
function transSelectModeToCtrl(v) { return v ? 'select' : 'remove'; };
function transSelectModeFromCtrl(v) {
  switch (v) {
    case 'select': return true;
    case 'remove': return false;
  };
};

EditPuppetDialogCtrl.$inject = [ '$scope', 'imageToMesh' ];
function EditPuppetDialogCtrl($scope, imageToMesh) {
  var $ctrl = this;

  /* zoompanner controls */
  $ctrl.zoomIn = imageToMesh.zoomIn;
  $ctrl.zoomOut = imageToMesh.zoomOut;
  $ctrl.togglePan = function() {
    imageToMesh.setPanEnabled(!imageToMesh.getPanEnabled());
  };
  $ctrl.getPanEnabled = imageToMesh.getPanEnabled;

  // dummy model for threshold. TODO: hook it up yo!
  $ctrl.threshold = 25;

  /* note: getEditMode is here to disable image edit controls with */
  $ctrl.getEditMode = function() {
    return transEditModeToCtrl(imageToMesh.getAddControlPoints());
  };
  $ctrl.editMode = function(newVal) {
    return arguments.length
      ? imageToMesh.setAddControlPoints(transEditModeFromCtrl(newVal))
      : $ctrl.getEditMode();
  };

  $ctrl.selectMode = function(newVal) {
    return arguments.length
      ? imageToMesh.setAddPixels(transEditModeFromCtrl(newVal))
      : transEditModeToCtrl(imageToMesh.getAddPixels());
  }
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
