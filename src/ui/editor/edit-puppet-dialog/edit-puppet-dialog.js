/** Dranimate Browser UI - Edit Puppet Dialog
 *
 * TODO: DOCUMENT
 */

(function() {

var edPupDogMod = angular.module('dran.editor.edit-puppet-dialog', [
  'ngMaterial',
  'dran.image-to-mesh',
  'dran.model'
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

  $ctrl.editMode = function(newVal) {
    return arguments.length
      ? imageToMesh.setAddControlPoints(transEditModeFromCtrl(newVal))
      : transEditModeToCtrl(imageToMesh.getAddControlPoints());
  };

  $ctrl.selectMode = function(newVal) {
    return arguments.length
      ? imageToMesh.setAddPixels(transSelectModeFromCtrl(newVal))
      : transSelectModeToCtrl(imageToMesh.getAddPixels());
  };

  $ctrl.notCropImgMode = function() {
    return imageToMesh.getAddControlPoints();
  };
}

edPupDogMod.directive('dranCancelEditPuppetDialog', ['$mdDialog', function($mdDialog) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      element.bind('click', function(ev) {
        $mdDialog.cancel();
      });
    }
  };
}]);

edPupDogMod.directive('dranFinishEditPuppetDialog', ['$mdDialog', function($mdDialog) {
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
    'imageToMesh',
    'model',
  function($mdMedia, $mdDialog, imageToMesh, model) {
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
          }).then(function() {
            imageToMesh.generateMesh();

            var vertices = imageToMesh.getVertices();
            var faces = imageToMesh.getTriangles();
            var controlPoints = imageToMesh.getControlPointIndices();
            var controlPointPositions = imageToMesh.getControlPoints();
            var image = imageToMesh.getImage();
            var imageNoBG = imageToMesh.getImageNoBackground();
            var backgroundRemovalData = imageToMesh.getBackgroundRemovalData();

            var p = new Puppet(image);
            p.setImageToMeshData(imageNoBG, controlPointPositions, backgroundRemovalData);
            p.generateMesh(vertices, faces, controlPoints);
            model.addPuppet(p);
          });
        });
      }
    };
}]);

})();
