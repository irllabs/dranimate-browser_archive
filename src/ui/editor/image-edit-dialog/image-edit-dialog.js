/** Dranimate Browser UI - Editor - Image Edit Dialog
 */

angular.module('dran.editor.imageEditDialog', [
    'ngMaterial',
    'zoompanner'
  ])
  .directive('dranImageEditDialog', function() {
    return {
      restrict: 'AE',
      templateUrl: 'src/ui/editor/image-edit-dialog.html',
      scope: { },
      controller: [function () {
      }]
    };
  });
