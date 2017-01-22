( function() {
  'use strict';

  /* @ngInject */
  angular
    .module( 'isc.forms' )
    .factory( 'iscFormsCodeTableApi', iscFormsCodeTableApi );

  /**
   * @ngdoc factory
   * @memberOf isc.forms
   * @param iscHttpapi
   * @param apiHelper
   * @param iscCustomConfigService
   * @returns {{getAsync: function, getSync: function}}
   */
  function iscFormsCodeTableApi( iscHttpapi, apiHelper, iscCustomConfigService ) {
    var config          = iscCustomConfigService.getConfig(),
        moduleConfig    = _.get( config, 'moduleApi', {} ),
        codeTableConfig = _.get( moduleConfig, 'formCodeTables' );

    var codeTableUrl = apiHelper.getConfigUrl( codeTableConfig );

    var codeTableCache = {};

    return {
      getAsync: getAsync,
      getSync : getSync
    };

    /**
     * @memberOf iscFormsCodeTableApi
     * @description
     * Loads a single code table from the server by name and caches it by name.
     * This call is guaranteed to cache at least an empty array.
     * @param {String} name - The code table name
     * @param {=String} order - The property used for ordering results
     * @returns {Promise}
     */
    function getAsync( name, order ) {
      var url = [codeTableUrl, name, '$'].join( '/' );
      if ( order ) {
        url += ( '?orderBy=' + order );
      }
      return iscHttpapi.get( url ).then(
        function( response ) {
          var codeTable    = applyResponseTransform( response ),
              tableToCache = ( codeTable && _.isArray( codeTable ) ) ? codeTable : [];

          _.set(
            codeTableCache,
            name,
            tableToCache
          );
          return codeTable;
        }
      );
    }

    /**
     * @memberOf iscFormsCodeTableApi
     * @description
     * Synchronously returns a single code table from the cache by name.
     * @param {String} name - The code table name
     * @returns {Array} - If this call returns undefined, then the codeTable with
     * "name" does not exist in the cache.
     */
    function getSync( name ) {
      return _.get(
        codeTableCache,
        name
      );
    }

    /**
     * @description Transforms the code table responses based on the configuration
     * @private
     * @param response
     * @returns {*}
     */
    function applyResponseTransform( response ) {
      var transformConfig = _.get( codeTableConfig, 'responseTransform' );

      if ( _.isFunction( transformConfig ) ) {
        return transformConfig( response );
      }
      else if ( _.isString( transformConfig ) ) {
        return _.get( response, transformConfig );
      }
      else {
        return response;
      }
    }
  }

} )();
