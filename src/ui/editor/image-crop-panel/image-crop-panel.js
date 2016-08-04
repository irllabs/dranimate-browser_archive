/** Dranimate Browser UI - Image Crop Panel
 *
 * Directive: dran-open-image-crop-panel (Attribute)
 *   Attach to button to open the panel with
 *
 * TODO: Boilerplate looks v similar to the one for puppet edit panel.
 *       generalize them into their own component?
 *       You can capture closing behaviours in onRemoving config for panel.
 *       something to keep in mind when generalizing them.
 *       Add animation to open from and close to button.
 */

(function() {

var imgCropPanMod = angular.module('dran.editor.image-crop-panel', [
  'ngMaterial',
  'dran.editor.edit-panel-inner'
]);

function ImageCropPanelCtrl() {
  var ctrl = this;

  // TODO: filler values in lieu of an actual model
  ctrl.zoomIn = function(ev) { console.log("image crop zoom in"); };
  ctrl.zoomOut = function(ev) { console.log("image crop zoom out"); };
  ctrl.panEnabled = false;

  // TODO
  ctrl.close = function(ev) { console.log("close this baby boy!"); };
};

imgCropPanMod.directive('dranOpenImageCropPanel', ['$mdPanel', function($mdPanel) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      element.bind('click', function() {
        var position = $mdPanel.newPanelPosition()
          .absolute()
          .center();
        var config = {
          attachTo: angular.element(document.body),
          controller: ImageCropPanelCtrl,
          controllerAs: '$ctrl',
          disableParentScroll: true,
          templateUrl: 'src/ui/editor/image-crop-panel/image-crop-panel.html',
          hasBackdrop: true,
          position: position,
          trapFocus: true,
          fullscreen: false, // TODO: fullscreen on small enough sizes
        };
        $mdPanel.open(config);
      });
    }
  };
});

})();
