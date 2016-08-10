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
          console.log(selectedPuppet[attr]);
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
};

pupdashMod.component('dranPuppetDashboard', {
  templateUrl: 'src/ui/editor/puppet-dashboard/puppet-dashboard.html',
  controller: PuppetDashboardCtrl
})

})();
