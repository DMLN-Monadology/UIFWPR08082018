/**
 * Created by Henry Zou on 11/21/15.
 */

(function () {
  'use strict';

  /* @ngInject */
  function iscLoggingInterceptor($q, devlog) {//jshint ignore:line
    // ----------------------------
    // factory class
    // ----------------------------

    var factory = {
      request      : request,
      response     : response,
      responseError: responseError
    };

    return factory;

    // ----------------------------
    // functions
    // ----------------------------
    function request(config) {//jshint ignore:line
      var htmlRegExp = /html$/;
      if (!htmlRegExp.test(config.url)) {
        devlog.channel('iscLoggingInterceptor').debug('iscLoggingInterceptor request for %s', config.url, config.data || '');
      }
      return config;
    }

    function response(response) {//jshint ignore:line
      //log everything that's an object and array
      if (_.isTypeOf(response.data, 'object') || _.isTypeOf(response.data, 'array')) {
        devlog.channel('iscLoggingInterceptor').debug('iscLoggingInterceptor response for %s', response.config.url, response);
      }
      return response;
    }

    function responseError(response) {
      devlog.channel('iscLoggingInterceptor').debug('iscLoggingInterceptor responseError for ', response);

      // $q.reject is needed inorder to invoke the next responseError interceptor in the array
      return $q.reject(response);
    }
  }// END CLASS

  // ----------------------------
  // injection
  // ----------------------------
  angular.module('isc.http')
    .factory('iscLoggingInterceptor', iscLoggingInterceptor);
})();
