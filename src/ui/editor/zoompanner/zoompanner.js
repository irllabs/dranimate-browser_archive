/** Dranimate Browser UI - Editor - Zoompanner
 *
 * Module Name: 'dran.editor.zoompanner'
 *
 * Component: dran-zoompanner
 *   zoomIn: required, one-way. What you'd expect.
 *   zoomOut: required, one-way. What you'd expect.
 *   panEnabled: required, two-way. What you'd expect.
 * Controller:
 *   zoomIn: function called on pressing zoom in button
 *   zoomOut: function called on pressing zoom out button
 *   panEnabled: boolean for when pan mode is enabled
 *   togglePan: function that toggles panEnabled, called on pressing pan button
 */

(function() {

var zoompanMod = angular.module('dran.editor.zoompanner', ['ngMaterial']);

zoompanMod.component('dranZoompanner', {
  templateUrl: 'src/ui/editor/zoompanner/zoompanner.html',
  bindings: {
    zoomIn: '<onZoomIn',
    zoomOut: '<onZoomOut',
    togglePan: '<onPanToggle',
    getPanEnabled: '<panEnabledGetter'
  }
});

})();
