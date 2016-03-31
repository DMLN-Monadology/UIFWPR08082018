/**
 * Created by hzou on 12/11/15.
 */

(function () {
  'use strict';

  angular
    .module('isc.common')
    .constant('componentConfig', getConfig());

  /*========================================
   =                 config                =
   ========================================*/
  function getConfig() {
    return {
      'devlogWhitelist': [],
      'session'        : {
        'routeMemoryExpirationInMinutes': 15
      },
      'debugDisplay'   : {
        'forms': {
          'additionalModels': false,
          'annotations'     : false,
          'formData'        : false
        }
      },
      'formats'        : {
        'date': {
          'shortDate'   : 'MM-DD-YYYY',
          'shortTime'   : 'h:mm A',
          'longDate'    : 'd MMMM yyyy',
          'longDateTime': 'd MMMM yyyy H:mm',
          'database'    : 'YYYY-MM-DD HH:mm:ss'
        }
      },
      'rolePermissions': {},
      'landingPages'   : {},
      'topTabs'        : {}
    };
  }

})();
