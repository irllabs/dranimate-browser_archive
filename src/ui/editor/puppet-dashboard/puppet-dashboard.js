/** Dranimate Browser UI - Puppet Dashboard
 *
 * Module Name: 'dran.editor.puppetDashboard'
 * Directive Name: <dran-puppet-dashboard>
 *
 * Contains UI for controlling puppet appearance
 * with buttons to open image and puppet editors.
 *
 * Note that puppet name changing has been moved to the editor (bring it back?)
 */

angular.module('dran.editor.puppetDashboard', [
    'ngMaterial',
    'dran.editor.imageEditDialog'
  ])

  .directive('dranPuppetDashboard', function() {
    return {
      restrict: 'AE',
      templateUrl: 'src/ui/editor/puppet-dashboard/puppet-dashboard.html',
      scope: { },
      controller: [
        '$scope',
        '$mdMedia',
        '$mdDialog',
      function($scope, $mdMedia, $mdDialog) {

        // TODO: connect to current puppet (dummy values for now)
        $scope.pupdash = {
          name: 'Puppet Name',
          x: 60,
          y: 75,
          rotation: 0,
          scaleX: 100,
          scaleY: 100
        };

        $scope.showImageEditDialog = function(ev) {
          $mdDialog.show({
            template: '<md-dialog class="edit-dialog"><dran-image-edit-dialog></dran-image-edit-dialog></md-dialog>',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $mdMedia('xs')
          });
        };

      }]
    };
  });
