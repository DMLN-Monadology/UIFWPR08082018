( function() {
  'use strict';

  angular
    .module( 'isc.lookahead' )
    .component( 'iscLookaheadComponent', {
      bindings    : {
        formConfig: '=',
        templates : '=',
        tags      : '=',
        source    : '=',
        onAdd     : '&',
        onRemove  : '&'
      },
      controller  : lookaheadController,
      controllerAs: 'lookCtrl',
      templateUrl : ['$element', '$attrs', function( $element, $attrs ) {
        return $attrs.templateUrl || 'isc.lookahead/isc.lookahead.html';
      }]
    } );

  /* @ngInject */
  function lookaheadController( devlog, $scope, $http ) {
    var log = devlog.channel( 'iscLookaheadComponent' );
    log.info( 'isc.lookahead.js LOADED' );

    var self = this;

    // ****************************************
    // LIFECYCLE HOOKS
    // ****************************************
    self.$onChanges = $onChanges;
    self.$onInit    = $onInit;
    self.$postLink  = $postLink;
    self.$onDestroy = $onDestroy;

    /////////////////////////

    function $onChanges( changes ) {
      log.info( '$onChanges' );
    }

    function $onInit() {
      log.info( '$onInit' );
    }

    function $postLink() {
      log.info( '$postLink' );

      self.tagAdded = function( tag ) {
        log.debug( 'Tag Added: ', tag );
        self.onAdd( { $event: { tags: self.tags } } );
      };

      self.tagRemoved = function( tag ) {
        log.debug( 'Tag Removed: ', tag );
        self.onRemove( { $event: { tags: self.tags } } );
      };
    }

    function $onDestroy() {
      log.info( '$onDestroy' );
    }
  }

} )();
