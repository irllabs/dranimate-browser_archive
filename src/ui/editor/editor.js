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

EditorCtrl.$inject = [ 'model' ];
function EditorCtrl(model) {
  var $ctrl = this;

  $ctrl.zoomIn = model.zoomIn;
  $ctrl.zoomOut = model.zoomOut;
  $ctrl.togglePan = function() { model.setPanEnabled(!model.getPanEnabled()); };
  $ctrl.getPanEnabled = model.getPanEnabled;
}

edMod.component('dranEditor', {
  templateUrl: 'src/ui/editor/editor.html',
  controller: EditorCtrl
});

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

edMod.directive('dranThreeContainer', ['model', function(model) {
  return {
    restrict: 'AE',
    link: function(scope, element) {
      /* element[0] gets the raw DOM reference from the jqlite object */
      model.setup(element[0]);
    }
  };
}]);

/* For Uploading Files */

edMod.directive('dranFileUploadContainer', function() {
  return {
    restrict: 'AE',
    link: function(scope, element) {
      var input = element.find('input');
      var button = element.find('button');
      if (input.length && button.length) {
        button.bind('click', function(ev) {
          input[0].click();
        });
      };
    }
  };
});

edMod.directive('dranNewPuppetFromJson', ['model', function(model) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      element.bind('change', function(e) {
        var reader = new FileReader();
        reader.onload = function (e) {
          var puppetData = JSON.parse(e.target.result);
          var image = new Image();
          image.onload = function () {
            var imageNoBG = new Image();
            imageNoBG.onload = function () {
              var p = new Puppet(image);
              p.setImageToMeshData(imageNoBG, puppetData.controlPointPositions, puppetData.backgroundRemovalData);
              p.generateMesh(puppetData.verts, puppetData.faces, puppetData.controlPoints);
              dranimate.addPuppet(p);
            };
            imageNoBG.src = puppetData.imageNoBGData;
          };
          image.src = puppetData.imageData;
        };
        reader.readAsText(element[0].files[0]);
      });
    }
  };
}]);

})();
