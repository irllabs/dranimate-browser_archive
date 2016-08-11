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
};

var configDefaults = {
  limit: function(v) { return v; },
  transToCtrl: function(v) { return v; },
  transFromCtrl: function(v) { return v; }
};

function mkGenericGetterSetter(model) {
  return function(attr, config) {
    var limit =
      config === undefined || config.limit === undefined
      ? configDefaults.limit
      : config.limit;
    var transToCtrl =
      config === undefined || config.transToCtrl === undefined
      ? configDefaults.transToCtrl
      : config.transToCtrl;
    var transFromCtrl =
      config === undefined || config.transFromCtrl === undefined
      ? configDefaults.transFromCtrl
      : config.transFromCtrl;
    return function(newVal) {
      var selectedPuppet = model.getSelectedPuppet();
      if (selectedPuppet === null) return nullDefaults[attr];
      else {
        if (arguments.length) {
          selectedPuppet[attr] = newVal === null
            ? nullDefaults[attr]
            : transFromCtrl(limit(newVal));
        } else {
          return transToCtrl(selectedPuppet[attr]);
        };
      };
    };
  };
};

function mkRestrict(min, max) {
  return function(num) {
    return Math.max(Math.min(num, max), min);
  };
};

function transScalingToCtrl(v) {
  return Math.round(v * 100);
};
function transScalingFromCtrl(v) {
  return v / 100;
};

PuppetDashboardCtrl.$inject = [ 'model' ];
function PuppetDashboardCtrl(model) {
  var $ctrl = this;
  var mkGetterSetter = mkGenericGetterSetter(model);

  $ctrl.x = mkGetterSetter('x', { transToCtrl: Math.round });
  $ctrl.y = mkGetterSetter('y', { transToCtrl: Math.round });
  $ctrl.scaleX = mkGetterSetter('scaleX', {
    limit: mkRestrict(1, 300),
    transToCtrl: transScalingToCtrl,
    transFromCtrl: transScalingFromCtrl
  });
  $ctrl.scaleY = mkGetterSetter('scaleY', {
    limit: mkRestrict(1, 300),
    transToCtrl: transScalingToCtrl,
    transFromCtrl: transScalingFromCtrl
  });
  $ctrl.rotation = mkGetterSetter('rotation', { limit: mkRestrict(-180, 180) });

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
