/** Dranimate Browser UI - Puppet Dashboard
 *
 * Module Name: 'dran.editor.puppetDashboard'
 *
 * Contains UI for controlling puppet appearance
 * with buttons to open image and puppet editors.
 *
 * Component: puppet-dashboard
 *   It's the puppet dashboard!
 * Controller:
 *   x: getterSetter for currently selected puppet's x attribute
 *   y: getterSetter for currently selected puppet's y attribute
 *   scaleX: getterSetter for currently selected puppet's scaleX attribute
 *   scaleY: getterSetter for currently selected puppet's scaleY attribute
 *   rotation: getterSetter for currently selected puppet's rotation attribute
 *   noPuppetSelected: fn returning if a puppet is currently selected or not
 *   deleteSelectedPuppet: fn to delete the currently selected puppet
 *
 * Note that puppet name changing has been moved to the editor (bring it back?)
 */

(function() {

var pupdashMod = angular.module('dran.editor.puppetDashboard', [
  'ngMaterial',
  'dran.editor.edit-puppet-dialog',
  'dran.model'
]);

var nullDefaults = {
  x: 0,
  y: 0,
  scaleX: 100,
  scaleY: 100,
  rotation: 0
}

function mkGenericGetterSetter(model) {
  return function(attr) {
    return function(newVal) {
      var selectedPuppet = model.getSelectedPuppet();
      if (selectedPuppet === null) return nullDefaults[attr];
      else {
        if (arguments.length) {
          selectedPuppet[attr] = newVal === null
            ? nullDefaults[attr]
            : newVal;
        } else {
          return selectedPuppet[attr];
        };
      };
    };
  };
};

PuppetDashboardCtrl.$inject = [ 'model' ];
function PuppetDashboardCtrl(model) {
  var $ctrl = this;
  var mkGetterSetter = mkGenericGetterSetter(model);

  $ctrl.x = mkGetterSetter('x');
  $ctrl.y = mkGetterSetter('y');
  $ctrl.rotation = mkGetterSetter('rotation');
  $ctrl.scaleX = mkGetterSetter('scaleX');
  $ctrl.scaleY = mkGetterSetter('scaleY');

  $ctrl.noPuppetSelected = function() {
    return model.getSelectedPuppet() === null;
  };

  $ctrl.deleteSelectedPuppet = model.deleteSelectedPuppet;
};

pupdashMod.component('dranPuppetDashboard', {
  templateUrl: 'src/ui/editor/puppet-dashboard/puppet-dashboard.html',
  controller: PuppetDashboardCtrl
})

})();
