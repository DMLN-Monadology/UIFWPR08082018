(function () {
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
    .module('isc.forms')
    .factory('iscFormlyFoundationTemplates', function ($filter, appConfig, iscFormsTemplateService) {
      var service = {
        init: init
      };

      return service;

      function init() {
        // Wrappers
        iscFormsTemplateService.registerWrapper([
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
        ]);


        // Templates
        // Base type overrides
        iscFormsTemplateService.registerBaseType();

        // Instructions (static text)
        iscFormsTemplateService.registerType({
          name       : 'instructions',
          templateUrl: 'forms/foundationTemplates/templates/instructions.html'
        });

        // Input
        iscFormsTemplateService.registerType({
          name          : 'input',
          templateUrl   : 'forms/foundationTemplates/templates/input.html',
          wrapper       : ['templateLabel', 'templateHasError'],
          defaultOptions: {
            templateOptions: { type: 'text' }
          }
        });

        // Checkbox
        iscFormsTemplateService.registerType({
          name       : 'checkbox',
          templateUrl: 'forms/foundationTemplates/templates/checkbox.html',
          wrapper    : ['templateHasError']
        });

        // Multi-select checkboxes
        iscFormsTemplateService.registerType({
          name          : 'multiCheckbox',
          templateUrl   : 'forms/foundationTemplates/templates/multiCheckbox.html',
          wrapper       : ['templateLabel', 'templateHasError'],
          defaultOptions: {
            noFormControl: false
          },
          controller    : /* @ngInject */ function ($scope) {
            var templateOptions  = $scope.to;
            var opts             = $scope.options;
            $scope.multiCheckbox = {
              checked: [],
              change : setModel
            };

            // initialize the checkboxes check property
            var modelValue = $scope.model[opts.key];
            if (angular.isArray(modelValue)) {
              var valueProp = templateOptions.valueProp || 'value';
              angular.forEach(templateOptions.options, function (v, index) {
                $scope.multiCheckbox.checked[index] = modelValue.indexOf(v[valueProp]) !== -1;
              });
            }

            function setModel() {
              $scope.model[opts.key] = [];
              angular.forEach($scope.multiCheckbox.checked, function (checkbox, index) {
                if (checkbox) {
                  $scope.model[opts.key].push(templateOptions.options[index]);
                }
              });
            }
          }
        });

        // Radio button
        iscFormsTemplateService.registerType({
          name      : 'radio',
          template  : '<isc-forms-radio id="id" ng-model="model[options.key]" model="model[options.key]" options="options" is-object-model="isObjectModel"></isc-forms-radio>',
          wrapper   : ['templateLabel', 'templateHasError'],
          controller: function ($scope) {
            var data = _.get($scope, 'options.data', {});

            // Use explicit definition if set, otherwise infer object/primitive mode based on first option in list
            $scope.isObjectModel = _.get(data, 'isObject');
            if ($scope.isObjectModel === undefined) {
              var options          = _.get($scope, 'to.options', []);
              $scope.isObjectModel = _.isObject(_.head(options));
            }
          }
        });

        // Select/dropdown
        iscFormsTemplateService.registerType({
          name       : 'select',
          templateUrl: 'forms/foundationTemplates/templates/select.html',
          wrapper    : ['templateLabel', 'templateHasError'],
          controller : function ($scope) {
            var data           = _.get($scope, 'options.data', {});
            $scope.displayProp = _.get(data, 'displayField', 'name');
            $scope.valueProp   = _.get(data, 'valueField', 'value');
            $scope.groupProp   = _.get(data, 'groupField', 'group');

            // Use explicit definition if set, otherwise infer object/primitive mode based on first option in list
            $scope.isObjectModel = _.get(data, 'isObject');
            if ($scope.isObjectModel === undefined) {
              var options          = _.get($scope, 'to.options', []);
              $scope.isObjectModel = _.isObject(_.head(options));
            }
          }
        });

        // Textarea
        iscFormsTemplateService.registerType({
          name          : 'textarea',
          template      : '<div class="grid-block"><textarea class="" ng-model="model[options.key]"></textarea></div>',
          wrapper       : ['templateLabel', 'templateHasError'],
          defaultOptions: {
            ngModelAttrs: {
              rows: { attribute: 'rows' },
              cols: { attribute: 'cols' }
            }
          }
        });

        // Date components [ DD / MM / YYYY ]
        iscFormsTemplateService.registerType({
          name          : 'dateComponents',
          template      : '<isc-forms-date-components ng-model="model[options.key]"></isc-forms-date-components>',
          wrapper       : ['templateLabel', 'templateHasError'],
          defaultOptions: {
            data: {
              tableCellTemplateUrl: 'shared/templates/cells/cell.date.html'
            }
          }
        });

        // Date components [ DD / MM / YYYY ]
        iscFormsTemplateService.registerType({
          name          : 'dateComponentsPartial',
          template      : '<isc-forms-date-components ng-model="model[options.key]" model-as-object="true" allow-partial-dates="true"></isc-forms-date-components>',
          wrapper       : ['templateLabel', 'templateHasError'],
          defaultOptions: {
            validators: {
              partialDate: {
                expression: function ($viewValue, $modelValue, scope) {
                  // Validator expression must return true or false
                  return !!(
                    // Define a partial date as: a year, a year and a month, or a full year, month, and day
                  _.isEmpty($viewValue) ||
                  (!$viewValue.year && !$viewValue.month && !$viewValue.day) ||
                  ($viewValue.year) ||
                  ($viewValue.year && $viewValue.month) ||
                  ($viewValue.year && $viewValue.month && $viewValue.day)
                  );
                },
                message   : '"A partial date must be: a year, a year and month, or a complete date."'
              }
            },
            data      : {
              tableCellDisplay: function (row, model) {
                // partialDate validator ensures we only have a day if we have a month,
                // and only have a month if we have a year
                var obj   = _.get(row, model, {}),
                    year  = parseInt(obj.year),
                    month = parseInt(obj.month) - 1, // months are 0-indexed in js dates and moment()
                    day   = parseInt(obj.day);

                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                  return $filter('iscDate')(new Date(year, month, day), _.get(appConfig, 'formats.date.shortDate', 'date'));
                }
                else if (!isNaN(month) && !isNaN(year)) {
                  return (month + 1) + '-' + year;
                }
                else if (!isNaN(year)) {
                  return year.toString();
                }
                else {
                  return '';
                }
              }
            }
          }
        });

        // Typeahead (text input with lookup)
        iscFormsTemplateService.registerType({
          name       : 'typeahead',
          templateUrl: 'forms/foundationTemplates/templates/typeahead.html',
          wrapper    : ['templateLabel', 'templateHasError'],
          controller : function ($scope) {
            var key             = $scope.options.key;
            $scope.displayField = _.get($scope.options, 'data.displayField', '');
            $scope.localModel   = {};

            $scope.onSelect = function (item) {
              if (_.isObject(item)) {
                var copiedItem          = _.merge({}, item);
                $scope.model[key]       = copiedItem;
                $scope.localModel.input = $scope.displayField
                  ? copiedItem[$scope.displayField]
                  : copiedItem;
              }
              else {
                $scope.localModel.input = $scope.model[key] = item;
              }
            }
          }
        });

        // Typeahead with third-party user script support
        iscFormsTemplateService.registerType({
          name       : 'typeaheadWithScript',
          templateUrl: 'forms/foundationTemplates/templates/typeaheadWithScript.html',
          wrapper    : ['templateLabel', 'templateHasError'],
          controller : function ($scope) {
            var key             = $scope.options.key;
            $scope.displayField = _.get($scope.options, 'data.displayField', '');
            $scope.localModel   = {};

            $scope.$watch(
              function () {
                return $scope.model[key];
              },
              function (val) {
                if ($scope.displayField) {
                  if (val) {
                    $scope.model[key]       = val || {};
                    $scope.localModel.input = val[$scope.displayField];
                  }
                }
                else {
                  $scope.localModel.input = val;
                }
              }
            );
          }
        });


        // Embedded form
        iscFormsTemplateService.registerType({
          name       : 'embeddedForm',
          templateUrl: 'forms/foundationTemplates/templates/embeddedForm.html',
          wrapper    : ['templateLabel', 'templateHasError'],
          controller : function ($scope) {
            var templateOptions = $scope.to;
            var opts            = $scope.options;

            $scope.efModel = $scope.model[opts.key] = ($scope.model[opts.key] || {});
            $scope.efFields  = templateOptions.fields;
            $scope.efOptions = {
              formState: $scope.formState
            };
          }
        });

        // Embedded form collection
        iscFormsTemplateService.registerType({
          name      : 'embeddedFormCollection',
          template  : '<isc-embedded-form-collection ng-model="model[options.key]" collection-label="to.label" options="options" form-state="formState" annotations="annotations" id="{{id}}"></isc-embedded-form-collection>',
          wrapper   : ['templateLabel', 'templateHasError'],
          controller: function ($scope, iscFormsValidationService) {
            iscFormsValidationService.registerCollection(
              $scope.options.key, {
                id   : $scope.id,
                label: $scope.to.label
              });
          }
        });

        // Embedded Form Listener
        // This field will not be rendered in the DOM, but will listen for FORMS_EVENTS
        // This is useful for communication in embedded subforms
        iscFormsTemplateService.registerType({
          name    : 'embeddedFormListener',
          template: '<isc-embedded-form-listener ng-model="model" options="options" form="form"></isc-embedded-form-listener>'
        });
      }

    });
})();
