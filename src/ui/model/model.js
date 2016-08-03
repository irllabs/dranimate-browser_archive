/** Dranimate Browser UI - Model
 *
 * Angular service wrapping the Dranimate object.
 *
 */

angular.module('dran.model', [ ])
  .factory('model', function() {
    return new Dranimate();
  });
