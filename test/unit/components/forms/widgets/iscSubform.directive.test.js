(function() {
  'use strict';

  //--------------------
  describe( 'iscSubform', function() {
    var suiteForm,
        suiteInternal,
        suiteSubform;

    var callbackResults = {};

    var mockFormCollectionCallbacks = {
      beforeUpdate: function updated() {
        callbackResults.updated = true;
      },
      beforeDelete: function deleted() {
        callbackResults.deleted = true;
      }
    };

    var mockLibrary = {
      model    : {
        getMaxSize    : function() {
          return 3;
        },
        getDefaultItem: function() {
          return {
            keyField: 'Default Object Key'
          };
        }
      },
      callbacks: mockFormCollectionCallbacks
    };

    window.useDefaultTranslateBeforeEach();

    beforeEach( module(
      'formly', 'foundation',
      'isc.http', 'isc.forms', 'iscNavContainer', 'isc.authorization', 'isc.notification', 'isc.directives',
      'isc.templates', 'isc.fauxTable', 'isc.filters',
      function( $provide, devlogProvider ) {
        $provide.value( '$log', console );
        $provide.value( 'apiHelper', mockApiHelper );
        $provide.value( 'iscCustomConfigService', mockCustomConfigService );

        // Mock over _.debounce so it executes during tests
        _.debounce = function( callback, time ) {
          return function() {
            callback();
          };
        };

        devlogProvider.loadConfig( mockCustomConfigService.getConfig() );
      } )
    );

    beforeEach( inject( function( $rootScope, $compile, $window, $httpBackend, $timeout, $sce,
      formlyApiCheck, formlyConfig, keyCode,
      iscConfirmationService, iscFormsTemplateService,
      iscFormsCodeTableApi, iscFormsApi, iscFormsModel,
      iscFormDataApi, iscNotificationService, iscFormsValidationService ) {
      formlyConfig.disableWarnings   = true;
      formlyApiCheck.config.disabled = true;

      suiteMain = window.createSuite( {
        $window     : $window,
        $compile    : $compile,
        $httpBackend: $httpBackend,
        $timeout    : $timeout,
        $rootScope  : $rootScope,
        $sce        : $sce,

        iscConfirmationService   : iscConfirmationService,
        keyCode                  : keyCode,
        iscFormDataApi           : iscFormDataApi,
        iscFormsApi              : iscFormsApi,
        iscFormsModel            : iscFormsModel,
        iscNotificationService   : iscNotificationService,
        iscFormsCodeTableApi     : iscFormsCodeTableApi,
        iscFormsTemplateService  : iscFormsTemplateService,
        iscFormsValidationService: iscFormsValidationService
      } );

      iscFormsTemplateService.registerType( {
        name      : 'customEmbeddedFormCollection',
        extends   : 'embeddedFormCollection',
        controller: function( $scope ) {
          $scope.config = {
            callbacks: {
              beforeUpdate: mockFormCollectionCallbacks.beforeUpdate,
              beforeDelete: mockFormCollectionCallbacks.beforeDelete
            },
            model    : {
              maxSize    : function() {
                return 3;
              },
              defaultItem: function() {
                return {
                  keyField: 'Default Hashtable Key'
                };
              }
            }
          };
        }
      } );

      mockFormResponses( suiteMain.$httpBackend );
    } ) );

    //--------------------
    describe( 'iscSubform - Save All', function() {
      beforeEach( function() {
        createDirectives( getMinimalForm( 'saveAllForm' ) );
      } );

      it( 'should save all the intermediate forms down to the root form', function() {
        var suite   = suiteSubform,
            subform = getSubform( 'subform1' ),
            testVal = 'foo';

        openForm( 'subform1' );
        openForm( 'subform2' );
        openForm( 'subform3' );

        var saveAllButton = suite.element.find( '.embedded-form-save-all' ).first(),
            inputField    = getControlByName( suite, 'aField3' );

        inputField.val( testVal ).trigger( 'change' );
        digest( suite );

        // Nothing is saved yet
        expect( suite.controller.model ).toEqual( {} );

        saveAllButton.click();
        digest( suite );

        // Now that all forms have saved down to the root form, the model should be updated
        var updatedField = suite.controller.model.subform1[0].subform2[0].subform3[0].aField3;
        expect( updatedField ).toEqual( testVal );

        function openForm( subformName ) {
          getSubform( subformName )
            .find( 'button.embedded-form-add' )
            .click();
        }

        function getSubform( name ) {
          return getControlByName( suite, name ).filter( '.subform' );
        }
      } );
    } );

    //--------------------
    describe( 'iscSubform - Version 1', function() {
      var formKey     = 'saveAllForm',
          formVersion = 'version1';

      beforeEach( function() {
        createDirectives( getMinimalForm( {
          formKey    : formKey,
          formVersion: formVersion
        } ) );
      } );

      it( 'should load a specific version of a form when configured in the FDN', function() {
        var suite   = suiteSubform,
            subform = getSubform( 'subform1' ),
            testVal = 'foo';

        openForm( 'subform1' );

        var saveAllButton = suite.element.find( '.embedded-form-save' ).first(),
            inputField    = getControlByName( suite, 'aField1Version1' );

        inputField.val( testVal ).trigger( 'change' );
        digest( suite );

        // Nothing is saved yet
        expect( suite.controller.model ).toEqual( {} );

        saveAllButton.click();
        digest( suite );

        // Now that all forms have saved down to the root form, the model should be updated
        var updatedField = suite.controller.model.subform1[0].aField1Version1;
        expect( updatedField ).toEqual( testVal );


        spyOn( suiteMain.iscFormsApi, 'getFormDefinition' ).and.callThrough();
        suiteMain.iscFormsModel.getFormDefinition( {
          formKey    : formKey,
          formVersion: formVersion,
          mode       : 'edit'
        } );

        expect( suiteMain.iscFormsApi.getFormDefinition ).not.toHaveBeenCalled();

        function openForm( subformName ) {
          getSubform( subformName )
            .find( 'button.embedded-form-add' )
            .click();
        }

        function getSubform( name ) {
          return getControlByName( suite, name ).filter( '.subform' );
        }
      } );
    } );

    //--------------------
    describe( 'iscSubform - configurable properties', function() {
      var existingModel = sampleConfigurableCollectionData.data;

      beforeEach( function() {
        createDirectives( getMinimalForm( {
          formKey   : 'subformConfigurable',
          formDataId: 4
        } ), {
          formConfig: {
            library: mockLibrary
          }
        } );

        callbackResults = {
          updated: false,
          deleted: false
        };
      } );

      it( 'should load in explicitly defined fields from the FDN', function() {
        var subformName = 'explicitlyDefinedCollectionFields',
            suite       = suiteSubform,
            subform     = getControlByName( suite, subformName ).filter( '.subform' ),
            addButton   = subform.find( 'button.embedded-form-add' ),
            model       = _.get( suite.controller.model, subformName ),
            saveButton  = null,
            inputField  = null;

        expect( addButton.length ).toBe( 1 );
        expect( subform.length ).toBe( 1 );

        // Open the subform
        expect( addButton.is( ':disabled' ) ).toBe( false );
        addButton.click();
        digest( suite );
        selectElements();

        // The defaultItem specified in the FDN should have loaded
        expect( inputField.length ).toBe( 1 );
        expect( inputField.val() ).toEqual( 'Default Value' );

        expect( saveButton.length ).toBe( 1 );
        saveButton.click();
        digest( suite );
        selectElements();

        // Since the FDN has a maxSize of 1, the add button should now be disabled
        expect( model.length ).toBe( 1 );
        expect( addButton.is( ':disabled' ) ).toBe( true );

        function selectElements() {
          inputField = getControlByName( suite, 'explicitInput' );
          saveButton = suite.element.find( '.embedded-form-save' );
          model      = _.get( suite.controller.model, subformName );
        }
      } );

      it( 'should save data to the model as an object', function() {
        var subformName = 'objectTypeCollection',
            suite       = suiteSubform,
            subform     = getControlByName( suite, subformName ).filter( '.subform' ),
            addButton   = subform.find( 'button.embedded-form-add' ),
            model       = _.get( suite.controller.model, subformName ),
            saveButton  = null,
            keyField    = null,
            valueProp1  = null,
            valueProp2  = null;

        // This is an 'object' type, so expect the editable model to be transformed
        // from this:
        var editedModel      = {
          keyField  : 'myKey',
          valueProp1: 'value 1',
          valueProp2: 'value 2'
        };
        // to this:
        var transformedModel = {
          myKey: {
            valueProp1: 'value 1',
            valueProp2: 'value 2'
          }
        };

        var expectedModel = _.extend( transformedModel, existingModel[subformName] );

        expect( addButton.length ).toBe( 1 );
        expect( subform.length ).toBe( 1 );

        // Open the subform
        expect( addButton.is( ':disabled' ) ).toBe( false );
        addButton.click();
        digest( suite );
        selectElements();

        // Fields should be present
        expect( keyField.length ).toBe( 1 );
        expect( valueProp1.length ).toBe( 1 );
        expect( valueProp2.length ).toBe( 1 );

        // The defaultItem specified in the FDN should have loaded
        expect( keyField.val() ).toEqual( 'Default Object Key' );

        // Set values in the fields
        keyField.val( editedModel.keyField ).trigger( 'change' );
        valueProp1.val( editedModel.valueProp1 ).trigger( 'change' );
        valueProp2.val( editedModel.valueProp2 ).trigger( 'change' );
        digest( suite );

        // Save the subform
        expect( callbackResults.updated ).toBe( false );
        expect( saveButton.length ).toBe( 1 );
        saveButton.click();
        digest( suite );
        selectElements();

        // Expect updated model to match the original model + the added item
        expect( angular.equals( model, expectedModel ) ).toBe( true );

        // Expect the callback specified in the config to have been invoked
        expect( callbackResults.updated ).toBe( true );

        // Since the FDN has a maxSize of 3, the add button should now be disabled
        expect( _.keys( model ).length ).toBe( 3 );
        expect( addButton.is( ':disabled' ) ).toBe( true );

        // Exercise the delete callback
        var deleteButton = subform.find( '.embedded-form-delete' ).first();
        expect( callbackResults.deleted ).toBe( false );
        deleteButton.click();
        expect( callbackResults.deleted ).toBe( true );

        function selectElements() {
          keyField   = getControlByName( suite, 'keyField' );
          valueProp1 = getControlByName( suite, 'valueProp1' );
          valueProp2 = getControlByName( suite, 'valueProp2' );

          model      = _.get( suite.controller.model, subformName );
          saveButton = subform.find( '.embedded-form-save' );
        }
      } );

      it( 'should save data to the model as a hashtable', function() {
        var subformName = 'hashtableTypeCollection',
            suite       = suiteSubform,
            subform     = getControlByName( suite, subformName ).filter( '.subform' ),
            addButton   = subform.find( 'button.embedded-form-add' ),
            model       = _.get( suite.controller.model, subformName ),
            saveButton  = null,
            keyField    = null,
            valueField  = null;

        // This is a 'hashtable' type, so expect the editable model to be transformed
        // from this:
        var editableModel    = {
          keyField  : 'myKey',
          valueField: 'myValue'
        };
        // to this:
        var transformedModel = {
          myKey: 'myValue'
        };

        var expectedModel = _.extend( transformedModel, existingModel[subformName] );

        expect( addButton.length ).toBe( 1 );
        expect( subform.length ).toBe( 1 );

        // Open the subform
        expect( addButton.is( ':disabled' ) ).toBe( false );
        addButton.click();
        digest( suite );
        selectElements();

        // Fields should be present
        expect( keyField.length ).toBe( 1 );
        expect( valueField.length ).toBe( 1 );

        // The defaultItem specified in the FDN should have loaded
        expect( keyField.val() ).toEqual( 'Default Hashtable Key' );

        // Set values in the fields
        keyField.val( editableModel.keyField ).trigger( 'change' );
        valueField.val( editableModel.valueField ).trigger( 'change' );
        digest( suite );

        // Save the subform
        expect( callbackResults.updated ).toBe( false );
        expect( saveButton.length ).toBe( 1 );
        saveButton.click();
        digest( suite );
        selectElements();

        // Expect updated model to match the original model + the added item
        expect( angular.equals( model, expectedModel ) ).toBe( true );

        // Expect the callback specified in the config to have been invoked
        expect( callbackResults.updated ).toBe( true );

        // Since the FDN has a maxSize of 3, the add button should now be disabled
        expect( _.keys( model ).length ).toBe( 3 );
        expect( addButton.is( ':disabled' ) ).toBe( true );

        // Exercise the delete callback
        var deleteButton = subform.find( '.embedded-form-delete' ).first();
        expect( callbackResults.deleted ).toBe( false );
        deleteButton.click();
        expect( callbackResults.deleted ).toBe( true );

        function selectElements() {
          keyField   = getControlByName( suite, 'keyField' );
          valueField = getControlByName( suite, 'valueField' );

          model      = _.get( suite.controller.model, subformName );
          saveButton = subform.find( '.embedded-form-save' );
        }
      } );
    } );

    //--------------------
    describe( 'iscSubform - computed field', function() {
      beforeEach( function() {
        createDirectives( getMinimalForm( 'computedFieldTestForm' ) );
      } );

      it( 'should compute a field based on its template and collection schema', function() {
        var subformName  = 'collection',
            suite        = suiteForm,
            subform      = getControlByName( suite, subformName ).filter( '.subform' ),
            addButton    = subform.find( 'button.embedded-form-add' ),
            saveButton   = null,
            firstName    = null,
            middleName   = null,
            lastName     = null,
            computedName = null,
            tableRows    = null;

        selectElements();

        expect( addButton.length ).toBe( 1 );
        expect( subform.length ).toBe( 1 );
        expect( tableRows.length ).toBe( 0 );

        // Open the subform
        addButton.click();
        selectElements();

        // Enter the name properties
        firstName.val( 'Joe' ).trigger( 'change' );
        middleName.val( 'Q' ).trigger( 'change' );
        lastName.val( 'Public' ).trigger( 'change' );

        // A computed field should not render an editable control in the collection
        expect( computedName.length ).toBe( 0 );

        // Save the row
        expect( saveButton.length ).toBe( 1 );
        saveButton.click();
        subform.trigger( 'change' );
        digest( suite );

        // Look at the table row in the collection view
        selectElements();
        expect( tableRows.length ).toBe( 1 );

        // The name values entered should display in columns 1-3
        expect( getTableCellValueByTag( 0, 'span' ) ).toEqual( 'Joe' );
        expect( getTableCellValueByTag( 1, 'span' ) ).toEqual( 'Q' );
        expect( getTableCellValueByTag( 2, 'span' ) ).toEqual( 'Public' );
        // Column 4 should have a concatenated value based on the template in the FDN
        // This is wrapped in a p tag, per the template
        expect( getTableCellValueByTag( 3, 'p' ).trim() ).toEqual( 'Joe Q Public' );


        function selectElements() {
          firstName    = getControlByName( suite, 'name.first' );
          middleName   = getControlByName( suite, 'name.middle' );
          lastName     = getControlByName( suite, 'name.last' );
          computedName = getControlByName( suite, 'computedName' );
          tableRows    = suiteForm.element.find( '.fauxTable .tbody .tr' );
          saveButton   = suite.element.find( '.embedded-form-save' );
        }

        function getTableCellValueByTag( index, tag ) {
          return $( $( tableRows.find( '.td' )[index] ).find( tag ) )[0].innerHTML;
        }
      } );

    } );

    //--------------------
    describe( 'iscSubform - codedItemCollection widget', function() {
      beforeEach( function() {
        createDirectives( getMinimalForm( {
          formKey   : 'codedItemCollectionTestForm',
          formDataId: 5
        } ) );
      } );

      it( 'should add codeTable items to an array for a codedItemCollection data model', function() {
        var subformName = 'collection',
            suite       = suiteForm,
            subform     = getControlByName( suite, subformName ).filter( '.subform' ),
            addButton   = subform.find( 'button.embedded-form-add' ),
            codeTable   = suiteMain.iscFormsCodeTableApi.getSync( 'usStates' ),
            model       = null,
            select      = null,
            saveButton  = null,
            tableRows   = null;

        selectElements();

        expect( addButton.length ).toBe( 1 );
        expect( subform.length ).toBe( 1 );
        expect( tableRows.length ).toBe( 1 );
        expect( model.length ).toBe( 1 );
        // Mock form data loads with Alabama selected
        expect( model[0] ).toEqual( codeTable[0] );

        // Open the subform
        addButton.click();
        digest( suite );
        selectElements();

        // Select Wyoming
        expect( select.length ).toBe( 1 );
        // There are 51 options in the list (first is default unselected option)
        select.val( getOptionValue( 50 ) ).trigger( 'change' );

        // Save the row
        expect( saveButton.length ).toBe( 1 );
        saveButton.click();
        subform.trigger( 'change' );
        digest( suite );
        selectElements();

        expect( model.length ).toBe( 2 );
        expect( model[0] ).toEqual( codeTable[0] );
        expect( model[1] ).toEqual( codeTable[49] );

        function getOptionValue( index ) {
          return $( select.find( 'option' )[index] ).val();
        }

        function selectElements() {
          tableRows  = suiteForm.element.find( '.fauxTable .tbody .tr' );
          saveButton = suite.element.find( '.embedded-form-save' );
          select     = subform.find( 'select[ng-model]' );
          model      = suiteForm.controller.internalModel.collection;
        }
      } );

    } );

    //--------------------
    describe( 'iscSubform - custom view template', function() {
      it( 'should render a custom view mode when configured', function() {
        suiteMain.iscFormsTemplateService.configureDefaultViewMode( {
          getValue   : getValue,
          wrapContent: wrapContent
        } );

        createDirectives( getMinimalForm( {
          formKey : 'simple1',
          mode : 'view'
        } ) );

        var aField = suiteSubform.element.find( '.find-me' );
        // Two fields on simple1
        expect( aField.length ).toBe( 2 );

        var viewValue = aField[0].outerHTML;

        // The result of getValue should be wrapped by wrapContent
        expect( viewValue ).toEqual( wrapContent( getValue() ).toString() );
        expect( viewValue ).toEqual( '<p class="find-me">test</p>' );

        function getValue( value ) {
          return 'test';
        }

        function wrapContent( value ) {
          return suiteMain.$sce.trustAsHtml( '<p class="find-me">' + value + '</p>' );
        }
      } );
    } );


    function createDirectives( rootForm, config ) {
      config    = config || {};
      // Create an isc-form to get what would normally be passed to isc-form-internal
      suiteForm = createDirective( rootForm, {
        localFormConfig  : config.formConfig || {},
        localButtonConfig: config.buttonConfig || {}
      } );
      suiteMain.$httpBackend.flush();

      suiteInternal = createDirective( getInternalForm(), {
        formCtrl: suiteForm.controller
      } );

      suiteInternal.controller = suiteInternal.$isolateScope.formInternalCtrl;

      suiteSubform = createDirective( getSubform(), {
        formInternalCtrl: suiteInternal.controller
      } );

      suiteSubform.controller = suiteSubform.$isolateScope.subformCtrl;
    }

  } );
})();