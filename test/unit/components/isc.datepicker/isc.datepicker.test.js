(function() {
  describe( 'iscDatepicker', function() {
    var suite;

    var ngModel        = moment( {
          year : 2017,
          month: 3, // April
          day  : 1
        } ).toISOString(),
        ngModelOptions = {
          updateOn    : 'blur',
          allowInvalid: true
        };

    window.useDefaultModules();

    beforeEach( module( 'isc.datepicker', 'isc.templates', 'moment-picker' ) );

    beforeEach( inject( function( $rootScope, $compile, $timeout ) {
      suite            = window.createSuite();
      suite.$compile   = $compile;
      suite.$timeout   = $timeout;
      suite.$rootScope = $rootScope;
    } ) );

    describe( 'sanity check', function() {
      it( 'should compile correctly', function() {
        compile();
        expect( suite.scope ).toBeDefined();
        expect( suite.element ).toBeDefined();
        expect( suite.controller ).toBeDefined();
        expect( suite.controller.ngModel ).toBeDefined();
        expect( suite.controller.ngModelCtrl ).toBeDefined();
        expect( suite.controller.formattedModel ).toBeDefined();
      } );
    } );

    describe( 'validation', function() {
      it( 'should validate the model using ngModelController', function() {
        var name        = 'myDate',
            format      = 'LL',
            initialDate = moment( ngModel ),
            newDate     = moment( ngModel ).add( 1, 'day' );

        compile( {
          config    : {
            format: format
          },
          name      : name,
          ngRequired: true
        } );

        var input   = suite.element.find( 'input' ),
            form    = suite.element.find( 'form' ),
            ngm     = suite.controller.ngModel,
            ngmCtrl = suite.controller.ngModelCtrl;


        // The initial date should load in and the form control should be pristine and untouched
        expect( ngmCtrl.$pristine ).toBe( true );
        expect( ngmCtrl.$untouched ).toBe( true );
        expect( ngmCtrl.$valid ).toBe( true );
        expect( getFormattedModel() ).toEqual( initialDate.format( format ) );

        // Set the input to have a different date
        input.val( newDate.format( format ) );
        triggerUpdate();

        // The new date should have triggered the form control to validate, and it should now be dirty and touched
        expect( ngmCtrl.$dirty ).toBe( true );
        expect( ngmCtrl.$touched ).toBe( true );
        expect( ngmCtrl.$valid ).toBe( true );
        expect( getFormattedModel() ).toEqual( newDate.format( format ) );

        // Clearing the input should null the model value
        spyOn( ngmCtrl, '$commitViewValue' ).and.callThrough();

        input.val( '' );
        triggerUpdate();

        expect( ngmCtrl.$modelValue ).toBe( null );

        // Since we configured this to be ng-required, it should also be $invalid
        expect( ngmCtrl.$invalid ).toBe( true );

        function triggerUpdate() {
          input.trigger( 'keydown' ).trigger( 'change' ).trigger( 'blur' );
          form.trigger( 'change' );
          suite.scope.$digest();
        }

        function getFormattedModel() {
          return ngmCtrl.$modelValue.format( format );
        }
      } );
    } );

    describe( 'configuration', function() {
      it( 'should format the date according to the configuration', function() {
        var format       = 'DD-YYYY/MMM', // weird format to ensure we aren't hitting defaults
            expectedDate = moment( ngModel ).format( format );

        compile( {
          config: {
            format: format
          }
        } );

        expect( expectedDate ).toEqual( '01-2017/Apr' );
        expect( getDatepicker().val() ).toEqual( expectedDate );
      } );

      it( 'should set the locale according to the configuration', function() {
        var format = 'LL', // include localized characters
            locale = 'zh-cn';

        var dateInDefaultLocale = moment( ngModel ).format( format ),
            expectedDate        = moment( ngModel ).locale( locale ).format( format );

        compile( {
          config: {
            format: format,
            locale: locale
          }
        } );

        var formattedVal = getDatepicker().val();
        expect( expectedDate ).toEqual( '2017年4月1日' );
        expect( formattedVal ).toEqual( expectedDate );
        expect( formattedVal ).not.toEqual( dateInDefaultLocale );
      } );
    } );

    function compile( scopeConfig ) {
      var html =
            "<form>" +
            " <isc-datepicker" +
            "  name='{{name}}' " +
            "  ng-model='ngModel' " +
            "  ng-model-options='ngModelOptions' " +
            "  ng-required='ngRequired'" +
            "  config='config'>" +
            " </isc-datepicker>" +
            "</form>";

      suite.scope = suite.$rootScope.$new();

      _.extend( suite.scope, {
        ngModel       : ngModel,
        ngModelOptions: ngModelOptions
      }, scopeConfig );

      suite.element = suite.$compile( html )( suite.scope );
      suite.scope.$digest();
      suite.$timeout.flush( 100 );
      suite.controller = suite.element.find( 'isc-datepicker' ).scope().dateCtrl;
    }


    function getDatepicker() {
      return suite.element.find( 'input' );
    }
  } );
})();