(function() {
  'use strict';

  var suiteForm,
      suiteInternal;

  //--------------------
  describe( 'iscFormInternal', function() {
    window.useDefaultTranslateBeforeEach();

    useDefaultFormsModules();

    beforeEach( module(
      'foundation', 'isc.authorization', 'isc.notification', 'isc.directives',
      function( $provide, devlogProvider ) {
        devlogProvider.loadConfig( mockCustomConfigService.getConfig() );
      } )
    );

    beforeEach( inject( function( $rootScope, $compile, $window, $httpBackend, $timeout,
      formlyApiCheck, formlyConfig,
      iscFormDataApi,
      iscFormsTemplateService, iscNotificationService, iscFormsValidationService ) {
      formlyConfig.disableWarnings   = true;
      formlyApiCheck.config.disabled = true;

      suiteMain = window.createSuite( {
        $window     : $window,
        $compile    : $compile,
        $httpBackend: $httpBackend,
        $timeout    : $timeout,
        $rootScope  : $rootScope,

        iscFormDataApi           : iscFormDataApi,
        iscFormsTemplateService  : iscFormsTemplateService,
        iscNotificationService   : iscNotificationService,
        iscFormsValidationService: iscFormsValidationService
      } );
      mockFormResponses( suiteMain.$httpBackend );
    } ) );

    describe( 'configured form', function() {
      beforeEach( function() {
        // Create an isc-form to get what would normally be passed to isc-form-internal
        suiteForm = createDirective( getConfiguredForm(), {
          localFormConfig  : {},
          localButtonConfig: {}
        } );
        suiteMain.$httpBackend.flush();

        suiteInternal = createDirective( getInternalForm(), {
          formCtrl: suiteForm.controller
        } );

        suiteInternal.controller = suiteInternal.$isolateScope.formInternalCtrl;
      } );

      //--------------------
      it( 'should change section when the selector is changed', function() {
        var suite         = suiteInternal,
            subformConfig = suite.controller.mainFormConfig,
            model         = suite.controller.model,
            lastSection   = subformConfig.sections[4],
            value         = 'something';

        spyOn( subformConfig, 'selectSection' ).and.callThrough();

        expect( getSectionIndex() ).toEqual( 0 );
        subformConfig.selectSection( 1 );
        expect( getSectionIndex() ).toEqual( 1 );

        // Once the model has been updated, section 5 should become visible
        spyOn( suiteMain.iscFormDataApi, 'post' ).and.callThrough();

        expect( model.RequiredInput ).toBeUndefined();
        expect( lastSection._isHidden ).toBe( true );

        // Enter a value for RequiredInput
        getControlByName( suite, 'RequiredInput' )
          .val( value )
          .trigger( 'change' );
        digest( suite );

        expect( model.RequiredInput ).toEqual( value );
        expect( lastSection._isHidden ).toBe( false );
        // This form is configured to autosave on section change
        expect( suiteMain.iscFormDataApi.post ).not.toHaveBeenCalled();

        // Change section to trigger saving and cover section watches
        subformConfig.selectSection( 2 );
        digest( suite );
        expect( suiteMain.iscFormDataApi.post ).toHaveBeenCalled();


        function getSectionIndex() {
          return _.indexOf( subformConfig.selectableSections, subformConfig.currentSection );
        }
      } );
    } );


    //--------------------
    describe( 'simple1 - sectionLayout by mode', function() {
      it( 'should render edit mode as wizard', function() {
        initForm( 'edit' );

        var layout = suiteInternal.controller.mainFormConfig.layout;
        expect( layout ).toBe( 'wizard' );
      } );

      it( 'should render view mode as paged', function() {
        initForm( 'view' );

        var layout = suiteInternal.controller.mainFormConfig.layout;
        expect( layout ).toBe( 'scrolling' );
      } );

      // it( 'should render a custom view mode when configured', function() {
      //   suiteMain.iscFormsTemplateService.configureDefaultViewMode( {
      //     getValue   : getValue,
      //     wrapContent: wrapContent
      //   } );
      //
      //   initForm( 'view' );
      //
      //   var aField = getControlByName(suiteInternal, 'aField');
      //   expect(aField.length).toBe(1);
      //
      //   function getValue( value ) {
      //     return 'test';
      //   }
      //
      //   function wrapContent( value ) {
      //     return suiteMain.$sce.trustAsHtml( '<p>' + value + '</p>' );
      //   }
      // } );

      function initForm( mode ) {
        // Create an isc-form to get what would normally be passed to isc-form-internal
        suiteForm = createDirective( getMinimalForm( {
          formKey: 'simple1',
          mode   : mode
        } ) );
        suiteMain.$httpBackend.flush();

        suiteInternal = createDirective( getInternalForm(), {
          formCtrl: suiteForm.controller
        } );

        suiteInternal.controller = suiteInternal.$isolateScope.formInternalCtrl;
      }
    } );
  } );


})();