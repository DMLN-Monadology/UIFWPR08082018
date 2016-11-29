/**
 * Created by hzou on 6/18/16.
 */

(function() {

  describe( 'iscConfirmationService', function() {
    var suite;

    window.useDefaultModules();

    beforeEach( module( 'isc.directives', 'isc.templates', function( iscConfirmationServiceProvider ) {
      suite = window.createSuite( {
        iscConfirmationServiceProvider: iscConfirmationServiceProvider
      } );
    } ) );

    beforeEach( inject( function( $rootScope, $compile, iscConfirmationService ) {
      _.extend( suite, {
        $rootScope            : $rootScope,
        $scope                : $rootScope.$new(),
        iscConfirmationService: iscConfirmationService,
        onResolve             : _.noop,
        onReject              : _.noop
      } );
    } ) );

    describe( 'set setup', function() {
      it( 'should have right dependencies', function() {
        expect( suite.iscConfirmationServiceProvider ).toBeDefined();
        expect( suite.iscConfirmationServiceProvider.setOptions ).toBeDefined();
        expect( suite.$rootScope ).toBeDefined();
        expect( suite.$scope ).toBeDefined();
        expect( suite.iscConfirmationService ).toBeDefined();
      } );
    } );

    describe( "iscConfirmationServiceProvider", function() {
      it( 'can set app level config using provider', function() {
        suite.iscConfirmationService.show();
        expect( suite.iscConfirmationService.options.title ).toBe( 'Please confirm your decision' );

        suite.iscConfirmationServiceProvider.setOptions( { title: "my custom title" } );
        suite.iscConfirmationService.show();
        expect( suite.iscConfirmationService.options.title ).toBe( 'my custom title' );
      } );

    } );

    describe( "suite.iscConfirmationService.hide()", function() {
      it( 'model.isOpen should be false', function() {
        suite.iscConfirmationService.hide();
        expect( suite.iscConfirmationService.isOpen ).toBe( false );
      } );

      describe( "suite.iscConfirmationService.show()", function() {
        it( 'should return a promise', function() {
          var expected = suite.iscConfirmationService.show();
          expect( _.isFunction( expected.then ) ).toBe( true ); // poor man's check for promise
        } );


        it( 'should set model.isOpen to true', function() {
          suite.iscConfirmationService.show();
          suite.$rootScope.$apply();
          expect( suite.iscConfirmationService.isOpen ).toBe( true ); // poor man's check for promise
        } );

        it( 'should set model.option.message to the passed in param', function() {
          suite.iscConfirmationService.show( "my custom message" );
          suite.$rootScope.$apply();
          expect( suite.iscConfirmationService.options.message ).toBe( "my custom message" );
        } );

        it( 'should also take an object and merge with options object', function() {
          suite.iscConfirmationService.show( { customProp: "hello", message: "my custom message" } );
          suite.$rootScope.$apply();
          expect( suite.iscConfirmationService.options.message ).toBe( "my custom message" );
          expect( suite.iscConfirmationService.options.customProp ).toBe( "hello" );
        } );

        it( 'should also take an object and override default option', function() {

          suite.iscConfirmationService.show();
          suite.$rootScope.$apply();
          expect( suite.iscConfirmationService.options.title ).toBe( "Please confirm your decision" );

          suite.iscConfirmationService.show( { title: "Custom Title" } );
          suite.$rootScope.$apply();
          expect( suite.iscConfirmationService.options.title ).toBe( "Custom Title" );
        } );

        describe( "suite.iscConfirmationService.resolve()", function() {
          it( 'should resolve the promise created by show()', function() {
            spyOn( suite, "onResolve" ).and.callThrough();
            spyOn( suite, "onReject" ).and.callThrough();

            suite.iscConfirmationService.show().then( suite.onResolve, suite.onReject );
            suite.iscConfirmationService.resolve();
            suite.$rootScope.$apply();

            expect( suite.iscConfirmationService.isOpen ).toBe( false );
            expect( suite.onResolve ).toHaveBeenCalled();
            expect( suite.onReject ).not.toHaveBeenCalled();
          } );
        } );

        describe( "suite.iscConfirmationService.reject()", function() {
          it( 'should reject the promise created by show()', function() {
            spyOn( suite, "onResolve" ).and.callThrough();
            spyOn( suite, "onReject" ).and.callThrough();

            suite.iscConfirmationService.show().then( suite.onResolve, suite.onReject );
            suite.iscConfirmationService.reject();
            suite.$rootScope.$apply();

            expect( suite.iscConfirmationService.isOpen ).toBe( false );
            expect( suite.onResolve ).not.toHaveBeenCalled();
            expect( suite.onReject ).toHaveBeenCalled();
          } );
        } );

      } );

    } );
  } );
})();