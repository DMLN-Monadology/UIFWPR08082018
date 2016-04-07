(function () {
  'use strict';

  angular.module('isc.forms')
    .directive('iscFormInternal', iscFormInternal);

  /* @ngInject */
  function iscFormInternal($q,
                           iscCustomConfigService, iscNotificationService, iscFormsValidationService) {
    var directive = {
      restrict        : 'E',
      replace         : true,
      controllerAs    : 'formInternalCtrl',
      scope           : {
        formDefinition : '=',
        model          : '=',
        options        : '=',
        formConfig     : '=',
        validateFormApi: '=',
        buttonConfig   : '='
      },
      bindToController: true,
      controller      : controller,
      templateUrl     : function (elem, attrs) {
        return attrs.templateUrl || 'forms/widgets/iscFormInternal/iscFormInternal.html';
      }
    };

    return directive;

    /* @ngInject */
    function controller($scope) {
      var self = this;

      _.merge(self, {
        forms           : [],
        debugDisplay    : _.get(iscCustomConfigService.getConfig(), 'debugDisplay.forms', {}),
        options         : {
          formState: {
            _mode       : self.mode,
            _validation : {},
            _annotations: {
              data: []
            },
            _subforms   : self.formDefinition.subforms
          }
        },
        childConfig     : {},
        formConfig      : {},
        buttonConfig    : {}
      }, self);

      self.additionalModels = _.get(self.formConfig, 'additionalModels', {});

      // Object to hold data and structure for temporary form validation
      self.validation = iscFormsValidationService.getValidationObject();

      // Submit button from buttonConfig is handled separately here, to work with $validation pipeline
      self.onSubmit = onSubmit;

      // Annotations
      self.closeAnnotations = closeAnnotations;

      init();


      // Private/helper functions
      function init() {
        // Initialize validation and notification components
        iscFormsValidationService.init(self.options);
        iscNotificationService.init();

        watchPages();
        _.defer(function () {
          self.currentPage = _.head(self.pages);
        }, 0);
      }

      function showFailedValidation(mainFormErrors, subformErrors) {
        mainFormErrors = _.compact(mainFormErrors);

        // Main form alerts
        // Limit error reporting to one per control; this needs to be done manually because notifications
        // can use ng-messages, but each notification has its own ng-messages collection.
        var alerts = {};

        _.forEach(mainFormErrors, function (error) {
          _.forEach(error, function (errorType) {
            _.forEach(errorType, function (errorInstance) {
              var fieldScope        = iscNotificationService.getFieldScope(errorInstance.$name);
              alerts[fieldScope.id] = {
                $error  : error,
                options : fieldScope.options,
                scrollTo: fieldScope.id
              };
            });
          });
        });

        _.forEach(alerts, function (alert) {
          iscNotificationService.showAlert(alert);
        });

        // Cascaded subform alerts
        _.forEach(subformErrors, function (error, id) {
          var alert = {
            scrollTo: id,
            content : makeError(error)
          };
          iscNotificationService.showAlert(alert);
        });

        function makeError(error) {
          return '<label class="error-message">In ' + error.label + ': ' + pluralize('record', error.records.length) + ' invalid.</label>';
        }

        function pluralize(text, count) {
          return count + ' ' + text + (count > 1 ? 's are' : ' is');
        }
      }


      // Sets up watches on pages having a hideExpression property
      function watchPages() {
        // Throttle for initial load or large model changes
        var throttledFilter = _.throttle(filterPages, 100);
        _.forEach(self.formDefinition.form.pages, function (page) {
          var hideExp = page.hideExpression;
          if (hideExp) {
            $scope.$watch(
              function () {
                return $scope.$eval(hideExp, self);
              },
              function (hidePage) {
                page._isHidden = hidePage;
                throttledFilter();
              });
          }
        });

        self.pages       = self.formDefinition.form.pages;
        self.multiConfig = {
          pages          : self.pages,
          layout         : self.formDefinition.form.pageLayout,
          currentPage    : self.currentPage,
          selectablePages: [],
          forms          : self.forms,
          buttonConfig   : self.buttonConfig || {}
        };

        throttledFilter();
      }

      function filterPages() {
        self.multiConfig.selectablePages = _.filter(self.formDefinition.form.pages, function (page) {
          return !page._isHidden;
        });
      }

      function closeAnnotations() {
        self.formConfig.annotationsApi.closeAnnotationPanel();
      }

      function onSubmit() {
        self.options.formState._validation.$submitted = true;

        // iscFormsValidationService.validateForm parses the outer forms on each page.
        var containingFormIsValid = true,
            $error                = [],
            index                 = 0;
        _.forEach(self.pages, function (page) {
          // Force each form (page) to validate if it is not hidden
          // Forms are generated by formly by index
          var form = self.forms[index++];
          if (!page._isHidden) {
            var formValidation    = iscFormsValidationService.validateForm(form);
            containingFormIsValid = formValidation.isValid && containingFormIsValid;
            $error                = $error.concat(formValidation.$error);
          }
        });

        // Additional validation via api attribute
        if (self.validateFormApi) {
          self.validateFormApi().then(function (result) {
            if (containingFormIsValid && result.isValid) {
              submitForm();
            }
            else {
              showFailedValidation($error, result.errors);
            }
          });
        }
        else {
          if (containingFormIsValid) {
            submitForm();
          }
        }
      }

      function submitForm() {
        var submitConfig = _.get(self.buttonConfig, 'submit', {}),
            onSubmit     = submitConfig.onClick || function () { },
            afterSubmit  = submitConfig.afterClick || function () { };

        $q.when(onSubmit())
          .then(afterSubmit);
      }
    }
  }
})();