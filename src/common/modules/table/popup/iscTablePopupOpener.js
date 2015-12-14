/**
 * Created by hzou on 09/14/2015
 *
 */

// opens zf-modal when inEditMode changes to 'popup'

(function(){
  'use strict';

  /* @ngInject */
  function iscTablePopupOpener($log, $state, $templateCache, $compile){//jshint ignore:line
    devlog.channel('').debug( 'iscTablePopupOpener LOADED');

    // ----------------------------
    // vars
    // ----------------------------

    // ----------------------------
    // class factory
    // ----------------------------
    return {
      restrict    : 'A',
      link        : link
    };

    // ----------------------------
    // functions
    // ----------------------------

    function link(scope, trElem, attrs, iscRowCtrl){
      scope.$watch('iscRowCtrl.inEditMode', function(newVal, oldVal){
        if(newVal !== oldVal){
          if( newVal === 'popup' ){
            trElem.parent().find('[zf-modal]').scope().show();
          } else {
            trElem.parent().find('[zf-modal]').scope().hide();
          }
        }
      });
    }
  }// END CLASS

  // ----------------------------
  // injection
  // ----------------------------
  angular.module('isc.table')
    .directive('iscTablePopupOpener', iscTablePopupOpener);

})();
