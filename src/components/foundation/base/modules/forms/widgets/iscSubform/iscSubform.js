(function () {
  'use strict';

  angular.module('isc.forms')
    .directive('iscSubform', iscSubform);

  /* @ngInject */
  function iscSubform(FORMS_EVENTS, $filter, iscScrollContainerService, iscConfirmationService) {//jshint ignore:line

    // ----------------------------
    // vars
    // ----------------------------

    // ----------------------------
    // class factory
    // ----------------------------
    var directive = {
      restrict        : 'E',
      replace         : true,
      controllerAs    : 'subformCtrl',
      scope           : {
        model       : '=',
        options     : '=',
        formTitle   : '=',
        breadcrumbs : '=',
        multiConfig : '=',
        singleConfig: '='
      },
      bindToController: true,
      controller      : controller,
      link            : link,
      templateUrl     : 'forms/widgets/iscSubform/iscSubform.html'
    };

    return directive;

    // ----------------------------
    // functions
    // ----------------------------
    function controller($scope) {
      var self = this;
      var currentScrollPos;

      self.breadcrumbs = self.breadcrumbs || [];
      self.childConfig = {
        breadcrumbs: self.breadcrumbs
      };
      self.breadcrumbs.push({
        name: self.formTitle,
        ctrl: self
      });

      self.onCancel = _.get(self, 'multiConfig.onCancel')
      || _.get(self, 'singleConfig.onCancel')
      || function () {
      };

      self.breadcrumbClick = function (index, onCancel) {
        var dirtyBreadcrumb;

        for (var i = index; i < self.breadcrumbs.length; i++) {
          var breadcrumb = self.breadcrumbs[i];
          if (_.get(breadcrumb, 'subform.form.$dirty')) {
            dirtyBreadcrumb = breadcrumb;
            break;
          }
        }

        if (dirtyBreadcrumb) {
          iscConfirmationService
            .show(dirtyBreadcrumb.childName + ' ' + $filter('translate')('contains unsaved data. Proceed?'))
            .then(onYes);
        }
        else {
          onYes();
        }
        function onYes() {
          onCancel();
        }
      };

      // Event listeners
      $scope.$on(FORMS_EVENTS.showSubform, function (event, subformParams) {
        var childName =
              $filter('translate')(subformParams.isNew ? 'Add' : 'Edit') + ' ' +
              $filter('translate')(subformParams.itemLabel);

        self.childConfig.isNew      = subformParams.isNew;
        self.childConfig.itemLabel  = subformParams.itemLabel;
        self.childConfig.model      = subformParams.model;
        self.childConfig.fields     = subformParams.fields;
        self.childConfig.options    = subformParams.options;
        self.childConfig.subform    = subformParams.subform;
        self.childConfig.onCancel   = subformParams.onCancel;
        self.childConfig.onSubmit   = subformParams.onSubmit;
        self.childConfig.formTitle  = childName;
        self.childConfig.renderForm = true;

        _.extend(
          _.last(self.breadcrumbs),
          {
            onCancel : subformParams.onCancel,
            subform  : subformParams.subform,
            childName: childName
          }
        );

        currentScrollPos = subformParams.scrollPos;

        // Prevent this event from cascading up to parents
        event.stopPropagation();
      });

      $scope.$on(FORMS_EVENTS.hideSubform, function (event) {
        self.childConfig.renderForm = false;

        _.defer(function () {
          delete self.childConfig.subform;
        }, 0);

        _.delay(function () {
          iscScrollContainerService.setCurrentScrollPosition(currentScrollPos, 150);
        }, 600);

        // Prevent this event from cascading up to parents
        event.stopPropagation();

        // Return to parent breadcrumb state
        var breadcrumb = self.breadcrumbs.pop();
        while (breadcrumb && breadcrumb.ctrl != self) {
          breadcrumb = self.breadcrumbs.pop();
        }
        self.breadcrumbs.push(breadcrumb);
      });

    }

    function link(scope, element, attrs) {
      iscScrollContainerService.setCurrentScrollPosition(0);
    }

  }//END CLASS

  // ----------------------------
  // injection
  // ----------------------------

})();
