/** Dranimate Browser UI - Image to Mesh Object
 */

// for debugging:
window.imageToMesh = new ImageToMesh();
// end for debugging.

angular.module('dran.image-to-mesh', [ ])
  .factory('imageToMesh', function() {
    // for debugging:
    return window.imageToMesh;
    // end for debugging.
    // return new ImageToMesh(); // uncomment for production
  });
