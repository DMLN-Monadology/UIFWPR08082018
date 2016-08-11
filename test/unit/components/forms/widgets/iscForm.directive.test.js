(function() {
  'use strict';

  //--------------------
  describe( 'iscForm', function() {
    var suiteConfigured,
        suiteMisconfigured,
        suiteWithData,
        suiteLibrary,
        suiteLiteralModel,
        suiteSimple1,
        suiteSimple2,
        suiteSimple3;

    // Some intentional mis-configurations to exercise safety nets
    var badFormConfig = {
      formDataApi   : {
        // this should normally call the save data API, if the default option is not to be used
        save  : null,
        // this should normally return the data to be saved wrapped with metadata
        wrap  : null,
        // this should normally unwrap the metadata from a saved form
        unwrap: function( formData ) {
          return null;
        }
      },
      annotationsApi: {
        getFormAnnotations: "this should normally be a function"
      }
    };

    var goodFormConfig = {
      additionalModelInit: function( additionalModels, stateParams, formModel ) {
        additionalModels.configuredModel = {
          "foo": "bar"
        };
        return additionalModels;
      }
    };

    var libraryFormConfig = {
      library: {
        // Overrides script1 defined in libraryScript and libraryEmbeddedScript
        script1       : function() {
          return "Set in controller script";
        },
        setModelDotLib: function( model, fieldScope ) {
          _.set( model, 'lib', _.get( model, fieldScope.options.key ) );
        }
      }
    };

    var literalModel = {
      "form": {
        "components": {
          "templates": {
            "input": {
              "text": "set in a literal model"
            }
          }
        }
      }
    };

    var goodButtonConfig = {};

    beforeEach( module(
      'formly', 'foundation',
      'isc.http', 'isc.forms', 'iscNavContainer', 'isc.authorization', 'isc.notification', 'isc.directives',
      'isc.templates', 'isc.fauxTable', 'isc.filters',
      function( $provide, devlogProvider ) {
        $provide.value( '$log', console );
        $provide.value( 'apiHelper', mockApiHelper );
        $provide.value( 'iscCustomConfigService', mockCustomConfigService );
        devlogProvider.loadConfig( mockCustomConfigService.getConfig() );
      } )
    );

    beforeEach( inject( function( $rootScope, $compile, $window, $httpBackend, $timeout,
      formlyApiCheck, formlyConfig,
      iscFormDataApi, iscNotificationService, iscFormsValidationService ) {
      formlyConfig.disableWarnings   = true;
      formlyApiCheck.config.disabled = true;

      suiteMain = window.createSuite( {
        $window     : $window,
        $compile    : $compile,
        $httpBackend: $httpBackend,
        $timeout    : $timeout,
        $rootScope  : $rootScope,

        formDataApi        : iscFormDataApi,
        notificationService: iscNotificationService,
        validationService  : iscFormsValidationService
      } );
      mockFormResponses( suiteMain.$httpBackend );
    } ) );

    //--------------------
    describe( 'suiteLibrary', function() {
      beforeEach( function() {
        suiteLibrary = createDirective( getMinimalForm( 'library' ), {
          localFormConfig: libraryFormConfig
        } );

        suiteMain.$httpBackend.flush();
        suiteMain.$timeout.flush();
      } );

      it( 'should call the library function when the input field is changed', function() {
        var suite      = suiteLibrary,
            model      = suite.controller.internalModel,
            newValue   = 'some value',
            inputField = getControlByName( suite, 'inputField' );

        expect( _.get( model, 'lib' ) ).toBeUndefined();

        // library.json's inputField has an onChange trigger
        // that calls setModelDotLib in _lib
        inputField.val( newValue ).trigger( 'change' );
        suiteMain.$timeout.flush();

        expect( _.get( model, 'inputField' ) ).toEqual( newValue );
        expect( _.get( model, 'lib' ) ).toEqual( newValue );
      } );


      it( 'should load function library definitions in subforms, overriding function definitions that are closer to the form', function() {
        var suite         = suiteLibrary,
            instructions  = suite.element.find( '.formly-field-instructions' ),
            instructions1 = instructions.filter( '.script1' ).find( '.ng-binding' ),
            instructions2 = instructions.filter( '.script2' ).find( '.ng-binding' ),
            instructions3 = instructions.filter( '.script3' ).find( '.ng-binding' );

        expect( instructions1.length ).toBe( 1 );
        expect( instructions2.length ).toBe( 1 );
        expect( instructions3.length ).toBe( 1 );

        // Mocks are set up so that:
        //   script3 is only defined in the script linked to the embedded form;
        //   script2 is defined as an override in the main form's script;
        //   script1 is defined as an override in the controller's script.
        // This exercises the order in which overrides are applied.
        expect( instructions1.html() ).toEqual( 'Set in controller script' );
        expect( instructions2.html() ).toEqual( 'Set in form script' );
        expect( instructions3.html() ).toEqual( 'Set in embedded script' );

      } );
    } );

    //--------------------
    describe( 'suiteSimple(s)', function() {
      describe( 'all simple suites', function() {
        beforeEach( function() {
          suiteSimple1 = createDirective( getMinimalForm( 'simple1' ) );
          suiteSimple2 = createDirective( getMinimalForm( 'simple2' ) );
          suiteSimple3 = createDirective( getMinimalForm( 'simple3' ) );

          suiteMain.$httpBackend.flush();
        } );

        //--------------------
        it( 'should have basic directive configuration', function() {
          testSuite( suiteSimple1 );
          testSuite( suiteSimple2 );
          testSuite( suiteSimple3 );

          function testSuite( suite ) {
            var formConfig   = getFormConfig( suite ),
                buttonConfig = getButtonConfig( suite );
            expect( formConfig ).toBeDefined();
            expect( buttonConfig ).toBeDefined();
          }
        } );

        //--------------------
        it( 'should populate a minimally specified form with defaults', function() {
          testSuite( suiteSimple1 );
          testSuite( suiteSimple2 );
          testSuite( suiteSimple3 );

          function testSuite( suite ) {
            var annotationsApi = getFormConfig( suite ).annotationsApi,
                buttonConfig   = getButtonConfig( suite );
            expect( _.isFunction( annotationsApi.getFormAnnotations ) ).toBe( true );
            expect( _.isFunction( buttonConfig.submit.onClick ) ).toBe( true );
          }
        } );

      } );

      describe( 'simple suite 1 only', function() {
        beforeEach( function() {
          suiteSimple1 = createDirective( getMinimalForm( 'simple1' ) );

          suiteMain.$httpBackend.flush();
        } );

        //--------------------
        it( 'should save when submit is clicked', function() {
          var suite              = suiteSimple1,
              submitButton       = getButton( suite, 'submit' ),
              buttonConfig       = getButtonConfig( suite ),
              submitButtonConfig = buttonConfig.submit;

          spyOn( submitButtonConfig, 'onClick' ).and.callThrough();
          spyOn( submitButtonConfig, 'afterClick' ).and.callThrough();
          spyOn( suiteMain.formDataApi, 'post' ).and.callThrough();
          spyOn( suiteMain.formDataApi, 'put' ).and.callThrough();

          // POST form
          submitButton.click();
          suiteMain.$httpBackend.flush();

          expect( submitButtonConfig.onClick ).toHaveBeenCalled();
          expect( submitButtonConfig.afterClick ).toHaveBeenCalled();
          expect( suiteMain.formDataApi.post ).toHaveBeenCalled();

          // PUT form
          submitButton.click();
          suiteMain.$httpBackend.flush();
          expect( suiteMain.formDataApi.put ).toHaveBeenCalled();
        } );

        //--------------------
        it( 'should go back when cancel is clicked', function() {
          var suite              = suiteSimple1,
              cancelButtonConfig = getButtonConfig( suite ).cancel;

          spyOn( cancelButtonConfig, 'onClick' ).and.callThrough();
          spyOn( cancelButtonConfig, 'afterClick' ).and.callThrough();
          spyOn( suiteMain.$window.history, 'back' ).and.callThrough();

          getButton( suite, 'cancel' ).click();

          expect( suiteMain.$window.history.back ).toHaveBeenCalled();
        } );
      } );
    } );


    //--------------------
    describe( 'suiteConfigured', function() {
      beforeEach( function() {
        suiteConfigured = createDirective( getConfiguredForm(), {
          localFormConfig  : goodFormConfig,
          localButtonConfig: goodButtonConfig
        } );
        suiteMain.$httpBackend.flush();
      } );

      //--------------------
      it( 'should load configuration passed to the directive', function() {
        var suite      = suiteConfigured,
            formConfig = getFormConfig( suite );

        expect( formConfig.additionalModels.configuredModel.foo ).toEqual( "bar" );
        // TODO -- extend
      } );

      //--------------------
      it( 'should run validation when submit is clicked', function() {
        var suite              = suiteConfigured,
            submitButton       = getButton( suite, 'submit' ),
            buttonConfig       = getButtonConfig( suite ),
            submitButtonConfig = buttonConfig.submit,
            model              = suite.controller.internalModel,
            subformRecord1     = {},
            subformRecord2     = {},
            subformRecordData  = {
              RequiredInputInASubform : "some data",
              RequiredInputInASubform2: "some other data"
            };

        spyOn( submitButtonConfig, 'onClick' ).and.callThrough();
        spyOn( submitButtonConfig, 'afterClick' ).and.callThrough();
        spyOn( suiteMain.formDataApi, 'post' ).and.callThrough();
        spyOn( suiteMain.formDataApi, 'put' ).and.callThrough();
        spyOn( suite.controller, 'validateFormApi' ).and.callThrough();
        spyOn( suiteMain.notificationService, 'showAlert' ).and.callThrough();

        submitButton.click();

        // Validation should fail
        // The submit.onClick function is only called once the validation in iscFormInternal succeeds
        expect( submitButtonConfig.onClick ).not.toHaveBeenCalled();
        expect( suite.controller.validateFormApi ).toHaveBeenCalled();
        expect( suiteMain.notificationService.showAlert ).toHaveBeenCalled();

        // Set the RequiredInput and add two empty records to the RequiredSubform
        getControlByName( suite, 'RequiredInput' )
          .val( 'some value' )
          .trigger( 'change' );

        // Adding objects directly to subform model, to bypass validation
        // This normally cannot be done through the UI but could be done through a script or event
        model.RequiredSubform = [];
        model.RequiredSubform.push( subformRecord1 );
        model.RequiredSubform.push( subformRecord2 );

        submitButton.click();

        // Validation should still fail due to the required fields in the RequiredSubform fields
        // This exercises the validation for subform records that are invalidated without being shown in the UI
        expect( submitButtonConfig.onClick ).not.toHaveBeenCalled();
        expect( suite.controller.validateFormApi ).toHaveBeenCalled();
        expect( suiteMain.notificationService.showAlert ).toHaveBeenCalled();

        _.extend( subformRecord1, subformRecordData );
        _.extend( subformRecord2, subformRecordData );
        suiteMain.$timeout.flush();
        submitButton.click();
        suiteMain.$timeout.flush();

        // Validation should now succeed
        expect( submitButtonConfig.onClick ).toHaveBeenCalled();
        expect( suite.controller.validateFormApi ).toHaveBeenCalled();
        suiteMain.$httpBackend.flush();
        expect( submitButtonConfig.afterClick ).toHaveBeenCalled();
        expect( suiteMain.formDataApi.post ).toHaveBeenCalled();
      } );

      //--------------------
      it( 'should validate data in a subform', function() {
        var suite = suiteConfigured,
            model = suite.controller.internalModel;

        spyOn( suiteMain.validationService, 'validateForm' ).and.callThrough();

        // Set the RequiredInput
        getControlByName( suite, 'RequiredInput' )
          .val( 'some value' )
          .trigger( 'change' );

        // Open the subform, enter a record, and submit the subform
        var subform = getControlByName( suite, 'RequiredSubform' ).filter( '.subform' );
        subform.find( 'button.embedded-form-add' ).click();

        var requiredInputs = getControlByName( suite, 'RequiredInputInASubform' ),
            subformSave    = suite.element.find( 'button.embedded-form-save' );

        requiredInputs.first().val( 'required field 1' ).trigger( 'change' );

        suiteMain.$timeout.flush();
        subformSave.click();

        // Only one of the required inputs has been entered, so validation for the subform fails
        expect( suiteMain.validationService.validateForm ).toHaveBeenCalled();
        expect( model.RequiredSubform ).toBeUndefined();

        requiredInputs.last().val( 'required field 2' ).trigger( 'change' );

        suiteMain.$timeout.flush();
        subformSave.click();

        // Update is performed on ngModelController, so trigger change on
        // the element with that ng-model
        subform.trigger( 'change' );
        digest( suite );

        expect( _.isArray( model.RequiredSubform ) ).toBe( true );
        expect( model.RequiredSubform.length ).toEqual( 1 );
      } );
    } );


    //--------------------
    describe( 'suiteMisconfigured', function() {
      beforeEach( function() {
        suiteMisconfigured = createDirective( getConfiguredForm(), {
          localFormConfig: badFormConfig
        } );
        suiteMain.$httpBackend.flush();
      } );

      //--------------------
      it( 'should fall back to default behaviors for poorly configured forms', function() {
        var suite        = suiteMisconfigured,
            buttonConfig = getButtonConfig( suite );
        expect( _.isFunction( buttonConfig.submit.onClick ) ).toBe( true );
        // TODO -- extend
      } );
    } );


    //--------------------
    describe( 'suiteWithData', function() {
      beforeEach( function() {
        suiteWithData = createDirective( getFormWithData() );
        suiteMain.$httpBackend.flush();
      } );

      //--------------------
      it( 'should parse the form data ID into an int', function() {
        var parsedId = suiteWithData.controller.parsedFormDataId;
        expect( parsedId ).not.toBe( "3" );
        expect( parsedId ).toBe( 3 );
      } );

      //--------------------
      it( 'should load form data from the ID', function() {
        var suite         = suiteWithData,
            mockData      = _.find( mockFormStore.formData, { id: 3 } ).data,
            expectedModel = suite.controller.internalModel,
            buttonConfig  = getButtonConfig( suite );

        expect( expectedModel.form.components.templates )
          .toEqual( mockData.form.components.templates );
        expect( buttonConfig.submit.onClick ).toBeDefined();
      } );

    } );

    describe( 'suiteWithData - view mode', function() {
      beforeEach( function() {
        suiteWithData = createDirective( getFormWithData( 'view' ) );
        suiteMain.$httpBackend.flush();
      } );


      //--------------------
      it( 'should load an existing form in view mode', function() {
        var suite        = suiteWithData,
            buttonConfig = getButtonConfig( suite );

        expect( buttonConfig.submit.hide ).toBe( true );

        var subform   = getControlByName( suite, 'subform.components' ).filter( '.subform' ),
            fauxTable = subform.find( 'faux-table' ),
            tableRows = fauxTable.find( '.tr' );

        expect( subform.length ).toBe( 1 );
        expect( fauxTable.length ).toBe( 1 );
        expect( tableRows.length ).toBe( 2 ); // one header row, one data row
      } );
    } );

    //--------------------
    describe( 'suiteLiteralModel', function() {
      beforeEach( function() {
        suiteLiteralModel = createDirective( getConfiguredForm(), {
          localModel: literalModel
        } );

        suiteMain.$httpBackend.flush();
        suiteMain.$timeout.flush();
      } );

      it( 'should load a literal model passed in', function() {
        var suite           = suiteLiteralModel,
            model           = suite.controller.internalModel,
            embeddedWrapper = 'form.components',
            inputKey        = 'templates.input.text',
            expectedValue   = getLocalModel(),
            inputField      = getControlByName( suite, inputKey ),
            newValue        = 'some new value';

        expect( inputField.length ).toBe( 1 );
        expect( getModel() ).toEqual( expectedValue );
        expect( inputField.val() ).toEqual( expectedValue );

        inputField.val( newValue ).trigger( 'change' );
        suiteMain.$timeout.flush();

        // The form's model should still update from UI changes
        expect( getModel() ).toEqual( newValue );

        // The literal model passed in should not be updated
        expect( getLocalModel() ).toEqual( expectedValue );

        function getLocalModel() {
          return _.get( literalModel, [embeddedWrapper, inputKey].join( '.' ) );
        }

        function getModel() {
          return _.get( model, [embeddedWrapper, inputKey].join( '.' ) );
        }
      } );

    } );

  } );
})();