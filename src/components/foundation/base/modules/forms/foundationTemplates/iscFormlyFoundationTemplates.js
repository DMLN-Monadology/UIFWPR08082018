(function() {
  'use strict';

  /** Templates adapted from angular-formly-templates-foundation 1.0.0-beta.1
   *  The foundation templates project itself does not work ootb with formly due to changes to api-check.
   *  All api-check calls are omitted from the implementation below.
   *
   *  Templates adapted from formlyFoundation are:
   *    input
   *    checkbox
   *    multiCheckbox
   *    radio
   *    select
   *    textarea
   *
   *  Wrappers adapted are:
   *    templateLabel
   *    templateHasError
   */

  /* @ngInject */
  angular
    .module( 'isc.forms' )
    .factory( 'iscFormlyFoundationTemplates', iscFormlyFoundationTemplates );

  /**
   * @ngdoc factory
   * @memberOf isc.forms
   * @param $filter
   * @param iscCustomConfigService
   * @param iscFormsTemplateService
   * @returns {{init: init}}
   * @description
   * Templates adapted from angular-formly-templates-foundation 1.0.0-beta.1
   *  The foundation templates project itself does not work ootb with formly due to changes to api-check.
   *  All api-check calls are omitted from the implementation below.
   *
   *  Templates adapted from formlyFoundation are:<br />
   *    input<br />
   *    checkbox<br />
   *    multiCheckbox<br />
   *    radio<br />
   *    select<br />
   *    textarea<br />
   *
   *  Wrappers adapted are:<br />
   *    templateLabel<br />
   *    templateHasError
   */
  function iscFormlyFoundationTemplates( $filter, iscCustomConfigService, iscFormsTemplateService ) {
    var service = {
      init: init
    };

    return service;

    function init() {
      // Wrappers
      iscFormsTemplateService.registerWrapper( [
        {
          name       : 'templateLabel',
          templateUrl: 'forms/foundationTemplates/wrappers/label.html'
        },
        {
          name       : 'templateConditionalLabel',
          templateUrl: 'forms/foundationTemplates/wrappers/conditional-label.html'
        },
        {
          name       : 'templateHasError',
          templateUrl: 'forms/foundationTemplates/wrappers/has-error.html'
        }
      ] );

      // Templates
      // Base type overrides
      iscFormsTemplateService.registerBaseType();

      // Instructions (static text)
      iscFormsTemplateService.registerType( {
        name       : 'instructions',
        templateUrl: 'forms/foundationTemplates/templates/instructions.html'
      } );

      // Input
      iscFormsTemplateService.registerType( {
        name          : 'input',
        templateUrl   : 'forms/foundationTemplates/templates/input.html',
        wrapper       : ['templateLabel', 'templateHasError'],
        defaultOptions: {
          templateOptions: { type: 'text' }
        }
      } );

      // Checkbox
      iscFormsTemplateService.registerType( {
        name       : 'checkbox',
        templateUrl: 'forms/foundationTemplates/templates/checkbox.html',
        wrapper    : ['templateHasError']
      } );

      // Multi-select checkboxes
      iscFormsTemplateService.registerType( {
        name          : 'multiCheckbox',
        templateUrl   : 'forms/foundationTemplates/templates/multiCheckbox.html',
        wrapper       : ['templateLabel', 'templateHasError'],
        defaultOptions: {
          noFormControl: false
        },
        /*@ngInject*/
        controller    : function( $scope ) {
          // When using a template that has an ng-model attribute which is not part of the form model
          // and which is dotted (i.e., "some.dotted.property"), angular-formly will automatically
          // change the ng-model attribute to the model of the formly field.
          // Setting skipNgModelAttrsManipulator to true prevents this and allows a local model
          // to be used for more complex components.
          $scope.options.extras.skipNgModelAttrsManipulator = true;

          var templateOptions = $scope.to,
              opts            = $scope.options,
              data            = opts.data;

          angular.extend( $scope, {
            valueField   : data.valueField,
            displayField : data.displayField,
            isObjectModel: data.isObject
          } );

          $scope.multiCheckbox = {
            checked: [],
            change : setModel
          };

          // initialize the checkboxes check property
          var modelValue = _.get( $scope.model, opts.key );
          if ( angular.isArray( modelValue ) ) {
            var valueField  = $scope.valueField || 'value',
                valueObject = {};
            angular.forEach( templateOptions.options, function( option, index ) {
              if ( $scope.isObjectModel ) {
                valueObject[valueField]             = option[valueField];
                $scope.multiCheckbox.checked[index] = !!_.find( modelValue, valueObject );
              }
              else {
                $scope.multiCheckbox.checked[index] = _.includes( modelValue, option );
              }
            } );
          }

          function setModel() {
            var array = [];
            _.set( $scope.model, opts.key, array );
            angular.forEach( $scope.multiCheckbox.checked, function( checkbox, index ) {
              if ( checkbox ) {
                array.push( templateOptions.options[index] );
              }
            } );
          }
        }
      } );

      // Radio button
      iscFormsTemplateService.registerType( {
        name       : 'radio',
        templateUrl: 'forms/foundationTemplates/templates/radio.html',
        wrapper    : ['templateLabel', 'templateHasError'],
        /*@ngInject*/
        controller : function( $scope ) {
          var data = _.get( $scope, 'options.data', {} );

          $scope.isObjectModel = _.get( data, 'isObject' );
        }
      } );

      // Select/dropdown
      iscFormsTemplateService.registerType( {
        name       : 'select',
        templateUrl: 'forms/foundationTemplates/templates/select.html',
        wrapper    : ['templateLabel', 'templateHasError'],
        /*@ngInject*/
        controller : function( $scope ) {
          var data           = _.get( $scope, 'options.data', {} );
          $scope.displayProp = _.get( data, 'displayField', 'name' );
          $scope.valueProp   = _.get( data, 'valueField', 'value' );
          $scope.groupProp   = _.get( data, 'groupField', 'group' );

          $scope.isObjectModel = _.get( data, 'isObject' );
        }
      } );

      // Textarea
      iscFormsTemplateService.registerType( {
        name          : 'textarea',
        templateUrl   : 'forms/foundationTemplates/templates/textarea.html',
        wrapper       : ['templateLabel', 'templateHasError'],
        defaultOptions: {
          ngModelAttrs: {
            rows: { attribute: 'rows' },
            cols: { attribute: 'cols' }
          }
        }
      } );

      // Date components [ DD / MM / YYYY ]
      iscFormsTemplateService.registerType( {
        name          : 'dateComponents',
        templateUrl   : 'forms/foundationTemplates/templates/dateComponents.html',
        wrapper       : ['templateLabel', 'templateHasError'],
        defaultOptions: {
          data: {
            tableCellTemplateUrl: 'forms/foundationTemplates/tableTemplates/cell.date.html'
          }
        }
      } );

      // Date components [ DD / MM / YYYY ]
      iscFormsTemplateService.registerType( {
        name          : 'dateComponentsPartial',
        templateUrl   : 'forms/foundationTemplates/templates/dateComponentsPartial.html',
        wrapper       : ['templateLabel', 'templateHasError'],
        defaultOptions: {
          validators: {
            partialDate: {
              expression: function( $viewValue, $modelValue, scope ) {
                // Validator expression must return true or false
                return !!(
                  // Define a partial date as: a year, a year and a month, or a full year, month, and day
                  _.isEmpty( $viewValue ) ||
                  ( !$viewValue.year && !$viewValue.month && !$viewValue.day ) ||
                  ( $viewValue.year ) ||
                  ( $viewValue.year && $viewValue.month ) ||
                  ( $viewValue.year && $viewValue.month && $viewValue.day )
                );
              },
              message   : '"A partial date must be: a year, a year and month, or a complete date."'
            }
          },
          data      : {
            tableCellDisplay: function( row, model ) {
              // partialDate validator ensures we only have a day if we have a month,
              // and only have a month if we have a year
              var obj   = _.get( row, model, {} ),
                  year  = parseInt( obj.year ),
                  month = parseInt( obj.month ) - 1, // months are 0-indexed in js dates and moment()
                  day   = parseInt( obj.day );

              if ( !isNaN( day ) && !isNaN( month ) && !isNaN( year ) ) {
                return $filter( 'iscDate' )( new Date( year, month, day ), _.get( iscCustomConfigService.getConfig(), 'formats.date.shortDate', 'date' ) );
              }
              else if ( !isNaN( month ) && !isNaN( year ) ) {
                return ( month + 1 ) + '-' + year;
              }
              else if ( !isNaN( year ) ) {
                return year.toString();
              }
              else {
                return '';
              }
            }
          }
        }
      } );

      // Typeahead (text input with lookup)
      iscFormsTemplateService.registerType( {
        name       : 'typeahead',
        templateUrl: 'forms/foundationTemplates/templates/typeahead.html',
        wrapper    : ['templateLabel', 'templateHasError'],
        controller : typeaheadController
      } );

      // Typeahead with third-party user script support
      iscFormsTemplateService.registerType( {
        name       : 'typeaheadWithScript',
        templateUrl: 'forms/foundationTemplates/templates/typeaheadWithScript.html',
        wrapper    : ['templateLabel', 'templateHasError'],
        controller : typeaheadController
      } );

      // Embedded form
      iscFormsTemplateService.registerType( {
        name       : 'embeddedForm',
        templateUrl: 'forms/foundationTemplates/templates/embeddedForm.html',
        wrapper    : ['templateLabel', 'templateHasError'],
        /*@ngInject*/
        controller : function( $scope ) {
          var templateOptions = $scope.to;
          var opts            = $scope.options;

          $scope.efModel = _.get( $scope.model, opts.key );
          if ( !$scope.efModel ) {
            $scope.efModel = {};
            _.set( $scope.model, opts.key, $scope.efModel );
          }

          $scope.efFields  = templateOptions.fields;
          $scope.efOptions = {
            formState: $scope.formState
          };
        }
      } );

      // Embedded form collection
      iscFormsTemplateService.registerType( {
        name       : 'embeddedFormCollection',
        templateUrl: 'forms/foundationTemplates/templates/embeddedFormCollection.html',
        wrapper    : ['templateLabel', 'templateHasError'],
        /*@ngInject*/
        controller : function( $scope, iscFormsValidationService ) {
          iscFormsValidationService.registerCollection(
            $scope.options.key, {
              id   : $scope.id,
              label: $scope.to.label
            } );
        }
      } );

      // Embedded Form Listener
      // This field will not be rendered in the DOM, but will listen for FORMS_EVENTS
      // This is useful for communication in embedded subforms
      iscFormsTemplateService.registerType( {
          name       : 'embeddedFormListener',
          templateUrl: 'forms/foundationTemplates/templates/embeddedFormListener.html'
        },
        {
          excludeFromWidgetLibrary: true
        }
      );

      // Control-flow-only widget
      // Useful for UI widgets that are needed to have an effect on control flow,
      // but whose data models should not be persisted in the form's data model.
      //
      // The template type used for the widget is data.controlFlowOnly.templateType;
      // its initial state may be specified with an expression in data.controlFlowOnly.stateInit.
      //
      // Sample usage in FDN:
      // {
      //   "key"            : "chooseBranch",
      //   "type"           : "controlFlowOnly",
      //   "templateOptions": {
      //     "label"  : "This field is for control flow only",
      //     "options": [
      //       "opt 1",
      //       "opt 2"
      //     ]
      //   },
      //   "data"           : {
      //     "controlFlowOnly" : {
      //       "templateType": "radio",
      //       "stateInit"   : "model.someProperty ? 'opt 1' : 'opt 2'"
      //     }
      //   }
      // }

      iscFormsTemplateService.registerType( {
        name       : 'controlFlowOnly',
        templateUrl: 'forms/foundationTemplates/templates/controlFlowOnly.html',
        /* @ngInject */
        controller : function( $scope, $templateCache ) {
          var stateKey  = '_controlFlowOnly',
              key       = $scope.options.key,
              data      = _.get( $scope.options, 'data.controlFlowOnly', {} ),
              stateInit = data.stateInit;

          // Eval the initial state based on the data property
          var initialValue = $scope.$eval( stateInit, {
            model: $scope.formModel
          } );

          // Persist it in formState under the stateKey
          _.set( $scope.formState, [stateKey, key].join( '.' ), initialValue );

          // The linked template will look up $scope.options.key in its $scope.model.
          // We will shadow its $scope.model with this $scope.localModel.
          $scope.localModel = _.get( $scope.formState, stateKey );

          // This widget requires a data.templateType property to specify the base
          // widget type that is to be rendered as control-flow-only.
          var templateType = data.templateType;
          if ( templateType ) {
            var type        = iscFormsTemplateService.getRegisteredType( templateType ),
                template    = _.get( type, 'template' ),
                templateUrl = _.get( type, 'templateUrl' );

            // If the base templateType is based on a string template instead of a templateUrl,
            // cache that template string so it can be referenced.
            if ( template && !templateUrl ) {
              templateUrl = [stateKey, templateType + '.html'].join('/');
              $templateCache.put(templateUrl, template);
            }

            if ( templateUrl ) {
              $scope.templateUrl = templateUrl;
            }
          }
        }
      } );

      /*@ngInject*/
      function typeaheadController( $scope ) {
        // When using a template that has an ng-model attribute which is not part of the form model
        // and which is dotted (i.e., "some.dotted.property"), angular-formly will automatically
        // change the ng-model attribute to the model of the formly field.
        // Setting skipNgModelAttrsManipulator to true prevents this and allows a local model
        // to be used for more complex components.
        $scope.options.extras.skipNgModelAttrsManipulator = true;

        var key  = $scope.options.key,
            data = _.get( $scope.options, 'data', {} );

        $scope.displayField   = data.displayField || '';
        $scope.localModel     = {};
        $scope.limitToList    = data.limitToList;
        $scope.minInputLength = parseInt( data.minInputLength );
        if ( _.isNaN( $scope.minInputLength ) ) {
          $scope.minInputLength = 3;
        }

        $scope.onSelect = function( item ) {
          if ( _.isObject( item ) ) {
            var copiedItem = angular.copy( item );
            _.set( $scope.model, key, copiedItem );
            $scope.localModel.input = $scope.displayField ? copiedItem[$scope.displayField] : copiedItem;
          }
          else {
            _.set( $scope.model, key, item );
            $scope.localModel.input = item;
          }
        };

        var initialModel = _.get( $scope.model, $scope.options.key, '' );
        if ( initialModel ) {
          $scope.onSelect( initialModel );
        }
      }
    }

  }
})();
