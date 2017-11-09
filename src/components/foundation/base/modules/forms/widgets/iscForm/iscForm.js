( function() {
  'use strict';

  angular.module( 'isc.forms' )
    .directive( 'iscForm', iscForm );

  /* @ngInject */
  function iscForm( $stateParams,
    iscFormsModel, iscFormsValidationService, iscFormsTemplateService ) {//jshint ignore:line
    var directive = {
      restrict        : 'E',
      replace         : true,
      controllerAs    : 'formCtrl',
      scope           : {
        buttonConfig: '=?',
        formConfig  : '=?',
        formDataId  : '@?',
        formKey     : '@?',
        formVersion : '@?',
        mode        : '@',
        model       : '=?'
      },
      bindToController: true,
      controller      : controller,
      templateUrl     : function( elem, attrs ) {
        return attrs.templateUrl || 'forms/widgets/iscForm/iscForm.html';
      }
    };

    return directive;

    /**
     * @memberOf iscForm
     */
    /* @ngInject */
    function controller( $scope ) {
      var self = this;

      var defaultFormConfig   = iscFormsTemplateService.getFormDefaults();
      self.internalFormConfig = _.defaultsDeep( self.formConfig || {}, defaultFormConfig );

      // If using a form data model specified with the model param, watching that param and updating the
      // internal model permits updating the form's model directly. This effectively creates a one-way binding
      // from the external model to the form's internal model.
      // This is counter to the transactional paradigm of the form data model, so must be explicitly
      // enabled through a config option.
      if ( self.internalFormConfig.allowExternalModelUpdates && self.model ) {
        var unwatch = $scope.$watch( self.model, function() {
          self.internalModel = self.model;
        }, true );

        $scope.$on( '$destroy', unwatch );
      }

      // Ensure id is either numeric or undefined (if passed directly from a route param, it could be a string)
      var parsedId          = parseInt( self.formDataId );
      self.parsedFormDataId = _.isNaN( parsedId ) ? undefined : parsedId;

      // Default mode is 'edit'
      self.mode = self.mode || 'edit';

      _.merge( self, {
        formDefinition        : {},
        internalFormDefinition: {},
        validationDefinition  : [],
        internalModel         : self.model || {},
        options               : {
          formState: {
            _mode       : self.mode,
            _id         : self.parsedFormDataId,
            _formKey    : self.formKey,
            _formVersion: self.formVersion,
            // lib is populated during init()
            lib         : {}
          }
        }
      } );

      self.validateFormApi = function() {
        return iscFormsValidationService.validateCollections( self.internalModel, self.validationDefinition );
      };

      init();

      /**
       * @memberOf iscForm
       */
      function init() {
        getFormData();
      }

      /**
       * @memberOf iscForm
       */
      function getFormData() {
        var config      = self.internalFormConfig,
            formDataApi = config.formDataApi;

        if ( _.isEmpty( self.internalModel ) ) {
          formDataApi.load( self.parsedFormDataId, config )
            .then( function( formData ) {
              self.internalModel = formDataApi.unwrap( formData ) || {};
              getFormDefinition();
            } );
        }
        else {
          getFormDefinition();
        }
      }

      /**
       * @memberOf iscForm
       */
      function getFormDefinition() {
        iscFormsModel.getFormDefinition( {
          formKey        : self.formKey,
          formVersion    : self.formVersion,
          mode           : self.mode,
          formLiteral    : self.internalFormConfig.formLiteral,
          loadFormAsAsset: self.internalFormConfig.loadFormAsAsset
        } )
          .then( afterFormDefinitionLoad )
          .then( iscFormsTemplateService.loadCodeTables )
          .then( getValidationDefinition );

        function afterFormDefinitionLoad( formDefinition ) {
          self.formDefinition                = formDefinition;
          self.options.formState._validateOn = formDefinition.form.validateOn;

          populateAdditionalModels( self.formDefinition.form.additionalModelInit );
          initializeUserLibrary( self.formDefinition.form.library );

          return formDefinition;
        }
      }

      /**
       * @memberOf iscForm
       * @param fdnScript
       * @description
       * If provided, call init function to populate additional dynamic data models
       */
      function populateAdditionalModels( fdnScript ) {
        var args = [self.internalFormConfig.additionalModels, $stateParams, self.internalModel, self.options.formState];
        evalScript( fdnScript, args );
        evalScript( self.internalFormConfig.additionalModelInit, args );

        function evalScript( script, args ) {
          if ( script && _.isFunction( script ) ) {
            script.apply( null, args );
          }
        }
      }

      /**
       * @memberOf iscForm
       * @param fdnLibraries
       * @description
       * If provided, populate user library of reusable functions from FDN and/or controller definition
       */
      function initializeUserLibrary( fdnLibraries ) {
        // First the global library
        mergeLibrary( iscFormsTemplateService.getGlobalFunctionLibrary() );

        // Apply libraries in reverse order to ensure that the library defined on the form itself takes precedence
        // over those in subforms.
        var fdnLibrary = fdnLibraries.pop();
        while ( fdnLibrary ) {
          mergeLibrary( fdnLibrary );
          fdnLibrary = fdnLibraries.pop();
        }

        // Finally, apply any library defined in client code
        mergeLibrary( self.internalFormConfig.library );

        function mergeLibrary( library ) {
          _.extend( self.options.formState.lib, library );
        }
      }

      /**
       * @memberOf iscForm
       */
      function getValidationDefinition() {
        return iscFormsModel.getValidationDefinition( {
          formKey    : self.formKey,
          formVersion: self.formVersion,
          formLiteral: self.internalFormConfig.formLiteral
        } )
          .then( function( validationDefinition ) {
            var sectionLayout = _.get( self.formDefinition.form, 'sectionLayout', 'scrolling' ),
                mode          = self.mode,
                modeLayout    = _.get( sectionLayout, mode, sectionLayout );

            var defaultButtonConfig   = iscFormsTemplateService.getButtonDefaults( mode, modeLayout );
            self.internalButtonConfig = _.defaultsDeep( self.buttonConfig || {}, defaultButtonConfig );

            self.validationDefinition = validationDefinition;
            self.showInternal         = true;
          } );
      }
    }
  }
} )();
