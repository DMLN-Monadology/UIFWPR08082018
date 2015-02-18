/**
 * Created by douglasgoodman on 12/9/14.
 */
(function(){
  'use strict';

  iscAuthenticationInterceptor.$inject = ['$log', '$rootScope', '$q', 'iscSessionModel', 'AUTH_EVENTS', '$templateCache'];

  function iscAuthenticationInterceptor( $log, $rootScope, $q, iscSessionModel, AUTH_EVENTS, $templateCache ){

    // ----------------------------
    // vars
    // ----------------------------

    // ----------------------------
    // factory class
    // ----------------------------

    var factory = {
      response: response,
      responseError: responseError
    };

    return factory;

    // ----------------------------
    // functions
    // ----------------------------

    function response( response ){
      //$log.debug( 'iscAuthenticationInterceptor.response ', response );
      if( response.config.url.indexOf( 'http' ) !== -1 ){
        //$log.debug('...http call');
        iscSessionModel.resetSessionTimeout();
      }

      var deferred = $q.defer();
      deferred.resolve( response );
      return deferred.promise;
    }

    function responseError( response ){
      //$log.debug( 'iscAuthenticationInterceptor.responseError ', response);
      $rootScope.$broadcast( AUTH_EVENTS.responseError, response );
      return $q.reject( response );
    }

  }// END CLASS

  // ----------------------------
  // injection
  // ----------------------------
  angular.module( 'isc.common' )
      .factory( 'iscAuthenticationInterceptor', iscAuthenticationInterceptor );
})();
