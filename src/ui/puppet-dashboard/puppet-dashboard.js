/** Dranimate Browser UI - Puppet Dashboard
 *
 * Module Name: 'app.puppetDashboard'
 * Directive Name: <puppet-dashboard>
 */

angular.module('app.puppetDashboard', ['ngMaterial'])
  .directive('puppetDashboard', function() {
    return {
      restrict: 'AE',
      templateUrl: 'puppet-dashboard.html',
      scope: { },
      controller: ['$scope', function($scope) {
        // TODO: connect to current puppet (dummy values for now)
        $scope.pupdash = {
          x: 60,
          y: 75,
          rotation: 54,
          scale: 100
        }
      }]
    };
  });
