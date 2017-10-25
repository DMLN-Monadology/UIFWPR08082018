( function() {
  'use strict';

  /* @ngInject */
  angular
    .module( 'isc.core' )
    .factory( 'iscVersionApi', iscVersionApi );
  /**
   * @ngdoc factory
   * @memberOf isc.core
   * @param $q
   * @param iscCustomConfigService
   * @returns {{load: load, get: get}}
   */
  function iscVersionApi( $q, iscCustomConfigService ) {
    var _versionInfo;

    return {
      load: load,
      get : get
    };

    /**
     * Loads the version information from the runtime config and caches it.
     * @returns {Promise}
     */
    function load() {
      var config = iscCustomConfigService.getConfig();

      // Wrapped in a $q promise for backwards compatibility with previous API
      return $q.when( _.get( config, 'appVersion', {} ) ).then( cacheVersion );

      function cacheVersion( version ) {
        _versionInfo = version;
        return _versionInfo;
      }
    }

    /**
     * Returns the current version info as an object.
     * @returns {Object}
     */
    function get() {
      return _.merge( {}, _versionInfo );
    }
  }

} )();
