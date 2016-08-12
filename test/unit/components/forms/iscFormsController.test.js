(function() {
  'use strict';

  describe( 'iscFormsController', function() {
    var suite = {};

    useDefaultModules( 'formly', 'isc.http', 'isc.forms', 'isc.templates',
      function ($provide) {
        suite = window.createSuite();
        $provide.value('apiHelper', mockApiHelper);
        $provide.value('iscCustomConfigService', mockCustomConfigService);
      });

    mockDefaultFormStates();
    
    // this loads all the external templates used in directives etc
    // eg, everything in **/partials/*.html
    beforeEach( module( 'isc.templates' ) );

    beforeEach( inject( function( $rootScope, $controller, $state, $stateParams, iscSessionModel ) {
      var scope = $rootScope.$new();

      suite.controller = $controller( 'iscFormsController as formsCtrl',
        {
          '$scope'      : scope,
          '$stateParams': $stateParams
        } );

      suite.self = scope.formsCtrl;
    } ) );

    afterEach( function() {
      cleanup( suite );
    } );

    // -------------------------
    describe( 'iscFormsController', function() {
      it( 'should load the state params', function() {
        expect( suite.self.params ).toEqual( {} );
        expect( suite.self.formConfig ).toEqual( {} );
      } );

    } );

  } );
})();

