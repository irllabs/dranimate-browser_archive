/** Dranimate Browser UI - Edit Puppet Dialog
 *
 * Directive: dran-cencel-edit-puppet-dialog (Attribute)
 *   Attach this to buttons that cancel the editing when clicked.
 *
 * Directive: dran-finish-edit-puppet-dialog (Attribute)
 *   Attach this to buttons that save the editing when clicked.
 *
 * Directive: dran-image-to-mesh-container (Attribute)
 *   Attach this to canvases (for now) that are to be used
 *   as the visualizer for imageToMesh object
 * TODO: rework behind the scenes code to be able to attach this
 *   to any generic container (to be as similar to dran.editor's
 *   dran-stage-container directive as possible). Uncomment relevant
 *   code in this file and its corresponding html template when done.
 *
 * Directive: dran-open-puppet-edit-dialog (Attribute)
 *   Attach this to a button that opens said dialog when clicked.
 * Controller:
 *   zoomIn: zooming in functionality for imageToMesh view
 *   zoomOut: zooming out functionality for imageToMesh view
 *   togglePan: toggling pan mode for imageToMesh view
 *   getPanEnabled: fn returning if imageToMesh view is in pan mode or not
 *   editMode: getterSetter for which edit mode is currently on
 *     'editCtrlPt': adding control points mode
 *     'cropImg': cropping image mode
 *   selectMode: getterSetter for if we're selecting or removing img in cropImg
 *     'select': selecting image parts
 *     'remove': removing image parts
 *   notCropImgMode: fn returning if we aren't in crop image mode or not
 *   threshold: dummy value for now.
 *     TODO: change into getterSetter and hook up to actual threshold property
 */

(function() {

var edPupDogMod = angular.module('dran.editor.edit-puppet-dialog', [
  'ngMaterial',
  'dran.image-to-mesh',
  'dran.model'
]);


/* this function has been placed here for convenience */
/* make quickfixes to puppet generating code here */
function makePuppetFromImageToMesh(imageToMesh, model) {
  return function() {
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
  };
};


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
      restrict: 'A', // delete this line when imageToMesh.setup works on any container
      // restrict: 'AE', // uncomment this line when imageToMesh.setup works on any container
      link: function(scope, element) {
        imageToMesh.setup(element[0]);
        imageToMesh.editImage(model.getSelectedPuppet().image.src);
      }
    };
}]);


/* dran-open-edit-puppet-dialog */

/* to translate properties from/to imageToMesh to/from the controller */
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
          }).then(makePuppetFromImageToMesh(imageToMesh, model));
        });
      }
    };
}]);

})();
