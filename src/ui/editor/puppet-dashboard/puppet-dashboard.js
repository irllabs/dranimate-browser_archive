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

(function() {

var pupdashMod = angular.module('dran.editor.puppetDashboard', [
  'ngMaterial',
  'dran.editor.edit-puppet-dialog'
]);

function PuppetDashboardCtrl() {
  var ctrl = this;

  ctrl.name = 'Puppet Name';
  ctrl.x = 60;
  ctrl.y = 75;
  ctrl.rotation = 0;
  ctrl.scaleX = 100;
  ctrl.scaleY = 100;
};

pupdashMod.component('dranPuppetDashboard', {
  templateUrl: 'src/ui/editor/puppet-dashboard/puppet-dashboard.html',
  controller: PuppetDashboardCtrl
})

})();
