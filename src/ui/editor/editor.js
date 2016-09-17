/** Dranimate Browser UI - Editor
 *
 * Module Name: 'dran.editor'
 *
 * Directive: dran-stage-container (Element, Attribute)
 *   Container for the main Dranimate stage to go into!
 *
 * Directive: dran-file-upload-container (Element, Attribute)
 *   Container for a file input and a button, configured s.t.
 *   clicking the button will forward that click to the file input.
 *
 * Directive: dran-new-puppet-from-json (Attribute)
 *   Binds code that loads in a puppet from its JSON representation
 *   to a file input's change event.
 *
 * Component: dran-editor
 *   The editor itself!
 * Controller:
 *   zoomIn: zooming in functionality for stage
 *   zoomOut: zooming out functionality for stage
 *   togglePan: toggling pan mode for stage
 *   getPanEnabled: fn returning if stage is in pan mode or not
 *   puppetIsSelected: fn returning if a puppet is selected or not
 */

(function() {

var edMod = angular.module('dran.editor', [
  'ngMaterial',
  'dran.editor.puppetDashboard',
  'dran.editor.zoompanner',
  'dran.model'
]);


/* this function has been placed here for convenience
 * It goes with dran-new-puppet-from-json */
/* for quickfixes: change arguments and contents of function w/in this one
 * to match changes made to the more canvas-y side of the codebase.
 * (function arguments are curried because i'm FP trash)
 */
function loadFile(model, element) {
  return function(e) {
    
    var imageTypes = ["image/jpeg", "image/jpg", "image/gif", "image/png"];
    var jsonTypes = ["application/json"];

    var filetype = element[0].files[0].type;

    /* this section is to deal with a strange bug on some windows machines where
     * uploaded files have their file types listed as an empty string. */
    if (filetype == "") {
      filetype = element[0].files[0].name.split(".");
      filetype = filetype[filetype.length - 1];
      if (filetype == "json") {
      	filetype = "application/json";
      }
      if (["jpeg","jpg","gif","png"].indexOf(filetype) !== -1) {
        filetype = "image/" + filetype;
      }
    }

    if (jsonTypes.indexOf(filetype) !== -1) {
      loadJSONPuppet(element, e);
    } else if (imageTypes.indexOf(filetype) !== -1) {
      loadImage(element, e);
    } else {
      console.log("loadFile() called for unsupported filetype: " + element[0].files[0].type);
    }
  };
};

function loadJSONPuppet(element, e) {
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
}

function loadImage(element, e) {
  var reader = new FileReader();
  reader.onload = function (e) {
    //open puppet edit window here !!!
    //console.log(reader.result);
    imageToMesh.editImage(reader.result);
  }
  reader.readAsDataURL(element[0].files[0]);
}

/* dran-stage-container */

edMod.directive('dranStageContainer', ['model', function(model) {
  return {
    restrict: 'AE',
    link: function(scope, element) {
      /* element[0] gets the raw DOM reference from the jqlite object */
      model.setup(element[0]);
    }
  };
}]);


/* dran-file-upload-container */

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


/* dran-new-puppet-from-json */

edMod.directive('dranNewPuppetFromJson', ['model', function(model) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      element.bind('change', loadFile(model, element));
    }
  };
}]);


/* dran-editor */

EditorCtrl.$inject = [ 'model' ];
function EditorCtrl(model) {
  var $ctrl = this;

  $ctrl.zoomIn = model.zoomIn;
  $ctrl.zoomOut = model.zoomOut;
  $ctrl.togglePan = function() { model.setPanEnabled(!model.getPanEnabled()); };
  $ctrl.getPanEnabled = model.getPanEnabled;

  $ctrl.puppetIsSelected = function() {
    return model.getSelectedPuppet() !== null;
  }
}

edMod.component('dranEditor', {
  templateUrl: 'src/ui/editor/editor.html',
  controller: EditorCtrl
});

})();
