/** Dranimate Browser UI - Edit Panel Inner
 *
 * Component: dran-edit-panel-inner
 *   Generic layout for edit panels (so far: image cropper and puppet editor)
 *   Attributes:
 *   - header-text: text to put in the header
 *   - on-close: function to call when close button is called
 *   Transclude Slots:
 *   - dran-edit-panel-main: the contents of the primary edit area
 *   - dran-edit-panel-side: the contents of the side panel
 *
 * Note: this just gives you the template to fill some editor in.
 * It does not come with the editor or the actual panel functionality.
 */

(function() {

var edPanInMod = angular.module('dran.editor.edit-panel-inner', ['ngMaterial']);

edPanInMod.component('dranEditPanelInner', {
  templateUrl: 'src/ui/edit-panel-inner/edit-panel-inner.html',
  transclude: {
    'editPanelMain': '?dranEditPanelMain',
    'editPanelSide': '?dranEditPanelSide'
  },
  bindings: {
    headerText: '@'
    close: '<onClose'
  }
});

})();
