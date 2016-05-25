(function() {
  'use strict';

  describe( 'iscAuthorizationModel test', function() {

    var suite = {
      authorizationModel         : undefined,
      sessionModel               : undefined,
      customConfigServiceProvider: undefined
    };
    
    afterEach( function() {
      cleanup( suite );
    } );
    
    // setup devlog
    beforeEach( module( 'isc.core', function( devlogProvider ) {
      devlogProvider.loadConfig( customConfig );
    } ) );

    beforeEach( module( 'isc.configuration', function( _iscCustomConfigServiceProvider_ ) {
      suite.customConfigServiceProvider = _iscCustomConfigServiceProvider_;
      suite.customConfigServiceProvider.loadConfig( customConfig );
    } ) );

    beforeEach( module( 'isc.authorization' ) );

    beforeEach( inject( function( _iscAuthorizationModel_, _iscSessionModel_ ) {
      suite.authorizationModel = _iscAuthorizationModel_;
      suite.sessionModel       = _iscSessionModel_;

      var loginData = angular.copy( mockLoginResponse );
      suite.sessionModel.create( loginData );
    } ) );

    describe( 'sanity check', function() {
      it( 'should factory and its methods should be defined', function() {
        expect( suite.authorizationModel ).toBeDefined();
        expect( suite.authorizationModel.isAuthorized ).toBeDefined();
      } );
    } );

    describe( 'checking permissions via isAuthorized', function() {

      it( 'should return false if the stateToCheck and/or permittedStates is null/undefined', function() {
        var stateToCheck = null;

        //suite.iscCustomConfigServiceProvider.addRolePermissions(permissions);
        var isAuthorized = suite.authorizationModel.isAuthorized( stateToCheck );
        expect( isAuthorized ).toBe( false );
      } );

      it( 'should allow all routes', function() {
        suite.customConfigServiceProvider.addRolePermissions( { 'index.messages.outbox': ['*'] } );
        var stateToCheck = 'index.messages.outbox';
        var isAuthorized = suite.authorizationModel.isAuthorized( stateToCheck );
        expect( isAuthorized ).toBe( true );
      } );

      it( 'should return false if the route is not permitted', function() {
        suite.customConfigServiceProvider.addRolePermissions( { 'index': ['*'] } );
        suite.customConfigServiceProvider.addRolePermissions( { 'index.home': ['*'] } );
        var stateToCheck = 'index.foo';

        var isAuthorized = suite.authorizationModel.isAuthorized( stateToCheck );
        expect( isAuthorized ).toBe( false );
      } );

      it( 'should return true if the route is permitted', function() {
        var isAuthorized, stateToCheck;

        suite.customConfigServiceProvider.addRolePermissions( { 'index': ['*'] } );
        suite.customConfigServiceProvider.addRolePermissions( { 'index.home': ['*'] } );

        stateToCheck = 'index';

        isAuthorized = suite.authorizationModel.isAuthorized( stateToCheck );
        expect( isAuthorized ).toBe( true );

        stateToCheck = 'index.home';
        isAuthorized = suite.authorizationModel.isAuthorized( stateToCheck );
        expect( isAuthorized ).toBe( true );
      } );

      it( 'should permit parent route if child route is permitted', function() {
        suite.customConfigServiceProvider.addRolePermissions( { 'index.home.leaf': ['*'] } );
        var stateToCheck = 'index.home';

        var isAuthorized = suite.authorizationModel.isAuthorized( stateToCheck );
        expect( isAuthorized ).toBe( true );

      } );

      it( 'should return true if the route is part of wild card pattern', function() {
        suite.customConfigServiceProvider.addRolePermissions( { 'index.*': ['*'] } );

        var stateToCheck = 'index.home';
        var isAuthorized = suite.authorizationModel.isAuthorized( stateToCheck );
        expect( isAuthorized ).toBe( true );

        stateToCheck = 'index.home.foo.bar';
        isAuthorized = suite.authorizationModel.isAuthorized( stateToCheck );
        expect( isAuthorized ).toBe( true );
      } );

      it( 'should return false if state is in black list', function() {
        suite.customConfigServiceProvider.addRolePermissions( { 'index.*': ['*'] } );
        suite.customConfigServiceProvider.addRolePermissions( { '!index.home.*': ['*'] } );

        var stateToCheck = 'index.home';
        var isAuthorized = suite.authorizationModel.isAuthorized( stateToCheck );
        expect( isAuthorized ).toBe( false );

        stateToCheck = 'index.home.child';
        isAuthorized = suite.authorizationModel.isAuthorized( stateToCheck );
        expect( isAuthorized ).toBe( false );

        stateToCheck = 'index.foo';
        isAuthorized = suite.authorizationModel.isAuthorized( stateToCheck );
        expect( isAuthorized ).toBe( true );
      } );

      it( 'should return false if state is in black list wild card pattern', function() {
        suite.customConfigServiceProvider.addRolePermissions( { 'index.*': ['*'] } );
        suite.customConfigServiceProvider.addRolePermissions( { '!index.home.*': ['*'] } );

        var stateToCheck = 'index.home.foo';
        var isAuthorized = suite.authorizationModel.isAuthorized( stateToCheck );
        expect( isAuthorized ).toBe( false );
      } );
    } );
  } );
})();
