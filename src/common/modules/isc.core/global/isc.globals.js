/**
 * Created by douglasgoodman on 11/21/14.
 */
(function () {
  'use strict';

  /* @ngInject */
  function iscGlobals(devlog, $rootScope, $document) {//jshint ignore:line
    var channel = devlog.channel('iscGlobals');

    // --------------------
    //$document.ready( function() {
    //  iscEnquireService.register("screen and (max-width: 767px)", {
    //
    //    match: function () {
    //      $rootScope.$broadcast('globalStyles:maxWidth767', true);
    //    },
    //
    //    unmatch: function () {
    //      $rootScope.$broadcast('globalStyles:maxWidth767', false);
    //    }
    //  });
    //});

    // ----------------------------
    // vars
    // ----------------------------

    var settings = {
      fixedHeader               : true,
      headerBarHidden           : true,
      leftbarCollapsed          : false,
      leftbarShown              : false,
      rightbarCollapsed         : false,
      fullscreen                : false,
      layoutHorizontal          : true,
      layoutHorizontalLargeIcons: false,
      layoutBoxed               : true,
      showSearchCollapsed       : false
    };

    var brandColors = {
      'default'     : '#ecf0f1',

      'inverse'     : '#95a5a6',
      'primary'     : '#3498db',
      'success'     : '#2ecc71',
      'warning'     : '#f1c40f',
      'danger'      : '#e74c3c',
      'info'        : '#1abcaf',

      'brown'       : '#c0392b',
      'indigo'      : '#9b59b6',
      'orange'      : '#e67e22',
      'midnightblue': '#34495e',
      'sky'         : '#82c4e6',
      'magenta'     : '#e73c68',
      'purple'      : '#e044ab',
      'green'       : '#16a085',
      'grape'       : '#7a869c',
      'toyo'        : '#556b8d',
      'alizarin'    : '#e74c3c'
    };

    // ----------------------------
    // class factory
    // ----------------------------

    var service = {
      values       : values,
      get          : get,
      set          : set,

      getBrandColor: getBrandColor,
      keyCode      : {
        BACKSPACE: 8,
        COMMA    : 188,
        DELETE   : 46,
        DOWN     : 40,
        END      : 35,
        ENTER    : 13,
        SHIFT    : 16,
        ESCAPE   : 27,
        HOME     : 36,
        LEFT     : 37,
        PAGE_DOWN: 34,
        PAGE_UP  : 33,
        PERIOD   : 190,
        RIGHT    : 39,
        SPACE    : 32,
        TAB      : 9,
        UP       : 38
      }
    };

    return service;

    // ----------------------------
    // functions
    // ----------------------------

    function values() { // should be getSettings or getAllSettings
      return settings;
    }

    function get(key) { // should be getSetting( key )
      channel.debug('iscGlobals.get');
      channel.debug('..settings: ' + JSON.stringify(settings));
      return settings[key];
    }

    function set(key, value) { // should be changeSetting( key )
      channel.debug('iscGlobals.set');
      settings[key] = value;

      $rootScope.$broadcast('globalStyles:changed', { key: key, value: settings[key] });
      $rootScope.$broadcast('globalStyles:changed:' + key, settings[key]);
    }

    // --------------------
    function getBrandColor(name) {
      channel.debug('iscGlobals.getBrandColor');
      if (brandColors[name]) {
        return brandColors[name];
      }
      else {
        return brandColors['default'];
      }
    }

  }// END CLASS

  // ----------------------------
  // inject
  // ----------------------------

  angular.module('isc.core')
    .factory('$global', iscGlobals);

})();
