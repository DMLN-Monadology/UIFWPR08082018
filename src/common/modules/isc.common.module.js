/**
 * Created by douglasgoodman on 11/21/14.
 */

(function () {
  'use strict';

  angular.module('isc.common',
    [
      // third party modules
      'angularUtils.directives.dirPagination',
      'ui.router',
      'mobile-angular-ui',
      'mobile-angular-ui.gestures',
      'ngSanitize',
      'ngAnimate',
      'pascalprecht.translate',
      'angular.filter',
      '720kb.datepicker',
      'foundation',
      'angucomplete-alt',
      'isc.core',
      'isc.authentication',
      'isc.authorization',
      'isc.directives',
      'isc.filters',
      'isc.table',
      'isc.http',
      'isc.router',
      'isc.states',
      'isc.spinner',

      // logging helper
      //'logLineNumber',

      // isc tabbed navigation module
      'iscNavContainer'
    ]);

})();
