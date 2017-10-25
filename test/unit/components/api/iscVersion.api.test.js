(function() {
  'use strict';

  describe( 'iscVersionApi', function() {
    var suite;

    var mockVersionInfo = {
      release: 'internal',
      build  : '2017-10-25',
      change : '123'
    };

    useDefaultModules( 'isc.core' );

    beforeEach( inject( function( $timeout, iscCustomConfigService, iscVersionApi ) {
      suite = window.createSuite( {
        iscVersionApi         : iscVersionApi,
        iscCustomConfigService: iscCustomConfigService,
        $timeout              : $timeout
      } );
    } ) );


    describe( 'iscVersionApi', function() {
      it( 'should have revealed functions', function() {
        expect( _.isFunction( suite.iscVersionApi.load ) ).toBe( true );
        expect( _.isFunction( suite.iscVersionApi.get ) ).toBe( true );
      } );
    } );

    describe( 'api.load and api.get', function() {
      it( 'should load the version info from the config', function() {
        spyOn( suite.iscCustomConfigService, 'getConfig' ).and.returnValue( {
          appVersion: mockVersionInfo
        } );

        spyOn( suite.iscVersionApi, 'load' ).and.callThrough();
        spyOn( suite.iscVersionApi, 'get' ).and.callThrough();

        suite.iscVersionApi.load();
        suite.$timeout.flush();

        var version = suite.iscVersionApi.get();
        expect( version ).toEqual( mockVersionInfo );
      } );
    } );

  } );

})();