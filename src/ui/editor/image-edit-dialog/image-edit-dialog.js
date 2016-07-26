/** Dranimate Browser UI - Editor - Image Edit Dialog
 */

angular.module('dran.editor.imageEditDialog', [
    'ngMaterial',
    'dran.editor.zoompanner'
  ])
  .directive('dranImageEditDialog', function() {
    return {
      restrict: 'AE',
      templateUrl: 'src/ui/editor/image-edit-dialog/image-edit-dialog.html',
      scope: { },
      controller: ['$scope', '$mdDialog', function ($scope, $mdDialog) {

        $scope.revert = function() {
          console.log('reverted!');
        }

        $scope.close = function() {
          $mdDialog.hide();
        }

        $scope.save = function() {
          console.log('saved!');
        }

      }]
    };
  });
