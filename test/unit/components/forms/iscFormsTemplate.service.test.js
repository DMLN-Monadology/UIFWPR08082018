(function() {
  'use strict';

  //--------------------
  describe( 'iscFormsTemplateService', function() {
    var suite,
        customButtonDefaults = {
          test: {
            onClick: _.noop
          }
        },
        mockMode             = 'edit',
        mockPageLayout       = 'wizard';


    window.useDefaultTranslateBeforeEach();

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

    beforeEach( inject( function( $rootScope, $compile, $httpBackend, $timeout,
      formlyApiCheck, formlyConfig,
      iscFormsTemplateService ) {

      formlyConfig.disableWarnings   = true;
      formlyApiCheck.config.disabled = true;

      suiteMain = window.createSuite( {
        $httpBackend: $httpBackend,
        $timeout    : $timeout,
        $rootScope  : $rootScope,
        $compile    : $compile,

        iscFormsTemplateService: iscFormsTemplateService
      } );
      mockFormResponses( suiteMain.$httpBackend );
    } ) );

    //--------------------
    // This creates a custom widget that includes a watcher in the default widget definition.
    // iscFormsTemplateService has a workaround function to address two issues with this:
    // 1. Angular does not recognize $watch listeners that are expressions;
    // 2. watchers defined directly on custom formly templates do not inherit to instances of that template.
    // This spec exercises the function that fixes these two issues.
    describe( 'testing watchers on custom templates', function() {
      beforeEach( function() {
        suiteMain.iscFormsTemplateService.registerType( {
          name          : 'customWatcherWidget',
          extends       : 'input',
          defaultOptions: {
            watcher: [
              {
                expression: 'model',
                listener  : 'model._watcher = model.fieldWithCustomWatcher',
                watchDeep : true
              }
            ]
          }
        } );

        suite = createDirective( getMinimalForm( 'customWatcher' ) );
        suiteMain.$httpBackend.flush();
      } );

      it( 'should load the test watcher form and fire the watch listener', function() {
        var model       = suite.controller.internalModel,
            newValue    = 'some value',
            controlName = 'fieldWithCustomWatcher',
            watcherProp = '_watcher',
            inputField  = getControlByName( suite, controlName );

        expect( _.get( model, controlName ) ).toBeUndefined();
        expect( _.get( model, watcherProp ) ).toBeUndefined();

        expect( inputField.length ).toBe( 1 );
        inputField.val( newValue ).trigger( 'change' );
        suiteMain.$timeout.flush();

        expect( _.get( model, controlName ) ).toEqual( newValue );

        // Now that the model has updated, the watcher should have fired and updated its own property
        expect( _.get( model, watcherProp ) ).toEqual( newValue );
      } );

      it( 'should remove the custom widget from the widget list with overrideWidgetList', function() {
        var widgetList = suiteMain.iscFormsTemplateService.getWidgetList();
        expect( widgetList ).toContain( 'customWatcherWidget' );

        // Overriding the visibility of the widget should remove it from the list
        suiteMain.iscFormsTemplateService.overrideWidgetList( 'customWatcherWidget', false );
        var updatedList = suiteMain.iscFormsTemplateService.getWidgetList();
        expect( updatedList ).not.toContain( 'customWatcherWidget' );
      } );
    } );

    describe( 'custom service-level button configurations', function() {
      it( 'should be returned by the service', function() {
        suiteMain.iscFormsTemplateService.registerButtonDefaults( customButtonDefaults );
        var expectedDefaults = suiteMain.iscFormsTemplateService.getButtonDefaults(
          mockMode,
          mockPageLayout
        );
        expect( customButtonDefaults ).toEqual( expectedDefaults );
      } );

      it( 'should handle a function definition for custom defaults', function() {
        suiteMain.iscFormsTemplateService.registerButtonDefaults( defaultsAsFunction );
        var expectedDefaults = suiteMain.iscFormsTemplateService.getButtonDefaults(
          mockMode,
          mockPageLayout
        );
        expect( customButtonDefaults ).toEqual( expectedDefaults );

        function defaultsAsFunction( mode, pageLayout ) {
          expect( mode ).toEqual( mockMode );
          expect( pageLayout ).toEqual( mockPageLayout );
          return customButtonDefaults;
        }
      } );
    } );

  } );
})();