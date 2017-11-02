/**
 * Created by hzou on 9/16/15.
 */

( function() {
  'use strict';
  // ----------------------------
  // injection
  // ----------------------------

  angular.module( 'isc.directives' )
    .directive( 'iscConfirmation', iscConfirmation );

  /**
   * @ngdoc directive
   * @memberOf directives
   * @name iscConfirmation
   * @restrict 'E'
   * @returns {{restrict: string, link: link, controller: controller, controllerAs: string, templateUrl: directive.templateUrl}}
   */
  /* @ngInject */
  function iscConfirmation( FoundationApi ) {//jshint ignore:line

    // ----------------------------
    // vars
    // ----------------------------

    // ----------------------------
    // class factory
    // ----------------------------
    var directive = {
      restrict    : 'E',
      scope       : {},
      link        : link,
      controller  : controller,
      controllerAs: 'iscConfirmCtrl',
      templateUrl : function( elem, attrs ) {
        return attrs.templateUrl || 'directives/iscConfirmation/iscConfirmation.html';
      }
    };

    return directive;

    // ----------------------------
    // link
    function link( $scope, elem, attrs, iscConfirmCtrl ) {
      $scope.$watch( 'iscConfirmCtrl.service.isOpen', function( newVal, oldVal ) {
        if ( newVal !== oldVal ) {
          if ( newVal === true ) {
            FoundationApi.publish( 'iscConfirmationModal', 'show' );
          }
          else {
            FoundationApi.publish( 'iscConfirmationModal', 'hide' );
          }
        }
      } );
    }

    // ----------------------------
    // controller
    /* @ngInject */
    function controller( iscConfirmationService ) {
      var self     = this;
      self.service = iscConfirmationService;
    }

  }//END CLASS

} )();
