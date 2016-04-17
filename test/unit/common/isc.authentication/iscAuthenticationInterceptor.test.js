
(function(){
  'use strict';
  //console.log( 'iscAuthenticationInterceptor Tests' );

  describe('iscAuthenticationInterceptor', function(){
    var rootScope,
      q,
      interceptor;

    // setup devlog
    beforeEach(module('isc.core', function (devlogProvider) {
      devlogProvider.loadConfig(customConfig);
    }));

    // show $log statements
    beforeEach( module(  'isc.authentication', function( $provide ){
      $provide.value('$log', mock$log);
    }));

    beforeEach( inject( function( $rootScope, $q, iscAuthenticationInterceptor ){
      rootScope = $rootScope; //NOTE when spying on $rootScope.$emit, you cant use $rootScope.$new()
      q = $q;
      interceptor = iscAuthenticationInterceptor;


    }));

    // -------------------------
    describe( 'responseError tests ', function(){

      it( 'should have a function responseError', function(){
        expect( angular.isFunction( interceptor.responseError )).toBe( true );
      });

      it( 'should do the right thing on responseError', function(){
        var response = {error: 'Oops'};

        spyOn( rootScope, '$emit' );
        spyOn( q, 'reject' );

        interceptor.responseError( response );

        expect( rootScope.$emit ).toHaveBeenCalled();
        expect( q.reject ).toHaveBeenCalledWith( response );
      });
    });

  });

})();

