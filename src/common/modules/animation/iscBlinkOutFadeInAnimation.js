/**
 * Created by douglas goodman on 3/10/15.
 */

(function(){
  'use strict';

  angular.module( 'isc.animation' )
    .animation( '.blink-out-fade-in', iscBlinkOutFadeInAnimation );


  /* @ngInject */
  function iscBlinkOutFadeInAnimation( devlog, $window, TweenMax, EASE_DUR ){

  // --------------------
  // vars
  // --------------------

  // --------------------
  // init
  // --------------------

  // --------------------
  // class factory
  // --------------------

  var animations = {
    beforeAddClass: beforeAddClass,
    beforeRemoveClass: beforeRemoveClass
  };

  return animations;

  // --------------------
  // functions
  // --------------------

    function beforeAddClass( element, className, done ){
      devlog.channel('iscBlinkOutFadeInAnimation').debug( 'iscBlinkOutFadeInAnimation.beforeAddClass' );
      if( className === 'blink-out-fade-in' ){
        TweenMax.set( element, {autoAlpha: 0, display: 'none'});
        done();
      }
      else {
        done();
      }
    }

    function beforeRemoveClass( element, className, done ){
      devlog.channel('iscBlinkOutFadeInAnimation').debug( 'iscBlinkOutFadeInAnimation.beforeRemoveClass' );
      if( className === 'blink-out-fade-in' ){
        TweenMax.set( element, {autoAlpha: 0, display: 'block'});
        TweenMax.to( element, EASE_DUR, {autoAlpha: 1, onComplete: done});
      }
      else {
        done();
      }
    }

  }// END CLASS

})();


