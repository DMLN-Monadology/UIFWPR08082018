/**
 * Created by douglasgoodman on 11/18/14.
 */

(function () {
  'use strict';

  angular.module('isc.authentication')
    .factory('iscSessionModel', iscSessionModel);

  /**
   * @memberof core-ui-authentication
   * @ngdoc factory
   * @param $q
   * @param $http
   * @param devlog
   * @param $rootScope
   * @param $interval
   * @param storage
   * @param iscSessionStorageHelper
   * @param AUTH_EVENTS
   * @returns {{create: create, destroy: destroy, initSessionTimeout: initSessionTimeout, stopSessionTimeout: stopSessionTimeout, resetSessionTimeout: resetSessionTimeout, getCredentials: getCredentials, getCurrentUser: getCurrentUser, getCurrentUserRole: getCurrentUserRole, isAuthenticated: isAuthenticated, getFullName: getFullName, configure: configure}}
   */
  function iscSessionModel($q, $http, devlog, $rootScope, $interval, storage, iscSessionStorageHelper, AUTH_EVENTS) {
    devlog.channel('iscSessionModel').debug('iscSessionModel LOADED');

    // ----------------------------
    // vars
    // ----------------------------

    var anonymousUser = { userRole: '*', FullName: 'anonymous' };
    var credentials   = null;
    var currentUser   = anonymousUser;

    var sessionTimeout = {
      warnAt     : 0,
      expireAt   : 0,
      maxAge     : 0,
      pingPromise: null,
      syncedOn   : null,
      status     : 'active'
    };

    var noResponseMaxAge = 60 * 5; // 5 minutes
    var warnThreshold    = 0.25;  //percent

    var isConfigured = false;
    // Initialize to empty promise in case it is not configured
    /**
     *
     * @returns {promise} The promise object calls "resolve" with an empty object as a parameter
     */
    var ping         = function () {
      var deferred = $q.defer();
      deferred.resolve({});
      return deferred.promise;
    };
    var sessionIdPath;

    var timeoutInterval;

    // ----------------------------
    // class factory
    // ----------------------------

    var model = {
      create : create,
      destroy: destroy,

      initSessionTimeout : initSessionTimeout,
      stopSessionTimeout : stopSessionTimeout,
      resetSessionTimeout: resetSessionTimeout,

      getCredentials: getCredentials,

      getCurrentUser    : getCurrentUser,
      getCurrentUserRole: getCurrentUserRole,

      isAuthenticated: isAuthenticated,
      getFullName    : getFullName,

      configure: configure
    };

    return model;

    // ----------------------------
    // functions
    // ----------------------------

    /**
     *
     * @param sessionData
     * @param isSessionNew
     */
    function create(sessionData, isSessionNew) {
      devlog.channel('iscSessionModel').logFn('create');
      // $log.debug( '...sessionData: ' + JSON.stringify( sessionData  ));

      // store the login response for page refreshes
      storage.set('loginResponse', sessionData);
      storage.set('jwt', sessionData.jwt);
      $http.defaults.headers.common.jwt = sessionData.jwt;

      credentials = {}; // for now we arent using credentials
      setCurrentUser(sessionData.UserData);

      // set the timeout
      sessionTimeout.maxAge = sessionData.SessionTimeout;
      iscSessionStorageHelper.setSessionExpiresOn(sessionData.sessionInfo.expiresOn);
      initSessionTimeout(sessionTimeout.maxAge);

      $rootScope.$emit(AUTH_EVENTS.sessionChange);
      if (isSessionNew) {
        devlog.channel('iscSessionModel').debug('...new ');
        $rootScope.$emit(AUTH_EVENTS.loginSuccess);
      }
      else {
        // $log.debug( '...resumed ' );
        $rootScope.$emit(AUTH_EVENTS.sessionResumedSuccess);
      }
    }

    /**
     *
     * @param config
     * @description
     * Configures session management for server communication
     * Pass in a configuration object with these properties:
     *
     * ping              - a function that calls a REST api which queries the server for remaining session time,
     *                       without causing a session time renewal
     * sessionIdPath     - the path in the response data that represents the session id
     */
    function configure(config) {
      isConfigured     = true;
      ping             = config.ping;
      sessionIdPath    = config.sessionIdPath;
      noResponseMaxAge = config.noResponseMaxAge || noResponseMaxAge;
    }

    //
    /**
     *
     * @param syncedOn
     * @returns {*}
     * @description
     * Calls a non-invasive ping API which inspects the current server session, without renewing that session,
     * and returns information about the time remaining in this session.
     */
    function callPing(syncedOn) {
      devlog.channel('iscSessionModel').logFn('callPing');
      sessionTimeout.syncedOn = syncedOn || sessionTimeout.syncedOn;

      var request = ping().then(_pingSuccess, _pingError)
        .finally(function () {
          sessionTimeout.pingPromise = null;
        });

      sessionTimeout.pingPromise = request;
      return request;

      // On successful ping, re-sync the local counter with the ping response,
      // falling back to no change in the counter.
      function _pingSuccess(response) {
        devlog.channel('iscSessionModel').logFn('_pingSuccess');
        var data                 = response.data;
        sessionTimeout.status    = 'active';
        sessionTimeout.syncedOn  = 'alive';
        sessionTimeout.sessionId = _.get(data, sessionIdPath, sessionTimeout.sessionId);
      }

      // Assumes any error returning from a ping means no server response
      function _pingError() {
        devlog.channel('iscSessionModel').logFn('_pingError');
        // Flag this as no response received
        if (sessionTimeout.status === 'active') {
          sessionTimeout.status = 'no response';
        }
      }
    }


    function destroy() {
      devlog.channel('iscSessionModel').logFn('destroy');

      // create a session with null data
      currentUser = anonymousUser;
      credentials = null;

      storage.remove('jwt');
      storage.remove('loginResponse');
      $http.defaults.headers.common.jwt = null;

      sessionTimeout.status = 'killed';

      // remove the user data so that the user
      // WONT stay logged in on page refresh
      iscSessionStorageHelper.destroy();
      stopSessionTimeout();

      $rootScope.$emit(AUTH_EVENTS.sessionChange);
      $rootScope.$emit(AUTH_EVENTS.logoutSuccess);
    }

    // --------------
    /**
     *
     * @param timeoutCounter
     */
    function initSessionTimeout() {
      devlog.channel('iscSessionModel').logFn("initSessionTimeout");

      var current = moment();

      var expiration = iscSessionStorageHelper.getSessionExpiresOn();

      // on page refresh we get this from sessionStorage and pass it in
      // otherwise assume it to be the maxAge
      sessionTimeout.warnAt   = current.add((expiration - current) * (1 - warnThreshold), 'ms').toDate();
      sessionTimeout.expireAt = expiration;
      _logTimer();
      doSessionTimeout();
    }

    /**
     * private
     */
    function doSessionTimeout() {
      devlog.channel('iscSessionModel').logFn("doSessionTimeout");
      if (timeoutInterval) {
        devlog.channel('iscSessionModel').debug('...already there');
        return;
      }

      // Checks to perform each tick
      timeoutInterval = $interval(function () {
        _logTimer();

        if (sessionTimeout.status === 'no response') {
          if (!sessionTimeout.pingPromise) {
            callPing('no response');
          }
          _checkForNoResponseAtMax();
        }
        else {
          if (!sessionTimeout.pingPromise) {
            _checkForWarnOrExpire(isConfigured);
          }
        }
      }, 3000);

      function _checkForNoResponseAtMax() {
        devlog.channel('iscSessionModel').logFn("_checkForNoResponseAtMax");
        // If the time with no response has reached its maximum, expire client session
        if (sessionTimeout.expireAt - new Date() < 0) {
          _expireSession();
        }
      }

      function _checkForWarnOrExpire(doPingFirst) {
        devlog.channel('iscSessionModel').logFn("_checkForWarnOrExpire");
        var now = new Date();

        // warn
        if (_.getRemainingTime(sessionTimeout.warnAt) <= 0 && _.getRemainingTime(sessionTimeout.expireAt) > 0) {
          devlog.channel('iscSessionModel').debug('...expireAt ', sessionTimeout.expireAt);
          if (doPingFirst && sessionTimeout.syncedOn !== 'warn') {
            callPing('warn').then(function () {
              _checkForWarnOrExpire(false);
            });
          }
          else {
            $rootScope.$emit(AUTH_EVENTS.sessionTimeoutWarning);
          }
        }

        // expire/logout
        else if (sessionTimeout.expireAt - Date.now() < 0) {
          devlog.channel('iscSessionModel').debug('...sessionTimeout.expireAt ' + sessionTimeout.expireAt);

          if (doPingFirst && sessionTimeout.syncedOn !== 'expire') {
            callPing('expire').then(function () {
              _checkForWarnOrExpire(false);
            });
          }
          else {
            _expireSession();
          }
        }
      }

      function _expireSession() {
        devlog.channel('iscSessionModel').logFn("_expireSession");
        $rootScope.$emit(AUTH_EVENTS.sessionTimeout);
        iscSessionStorageHelper.setShowTimedOutAlert(true);
        stopSessionTimeout();
      }
    }

    /**
     *
     */
    function stopSessionTimeout() {
      devlog.channel('iscSessionModel').logFn("stopSessionTimeout");
      if (angular.isDefined(timeoutInterval)) {
        devlog.channel('iscSessionModel').debug('...cancelling');
        $interval.cancel(timeoutInterval);
        timeoutInterval = null;
      }

      devlog.channel('iscSessionModel').debug('...timeoutInterval', timeoutInterval);
    }

    function resetSessionTimeout() {
      devlog.channel('iscSessionModel').logFn("resetSessionTimeout");
      var current = moment();
      // Do not reset timer if we are still waiting on a server response to a ping call
      if (sessionTimeout.syncedOn !== 'no response') {
        sessionTimeout.expireAt = moment().add(sessionTimeout.maxAge, 's').toDate();
        sessionTimeout.warnAt   = current.add((sessionTimeout.expireAt - current) * (1 - warnThreshold), 'ms').toDate();
        sessionTimeout.syncedOn = 'alive';
      }
    }

    // --------------
    /**
     *
     * @returns {*}
     */
    function getCredentials() {
      return credentials;
    }

    // --------------
    /**
     *
     * @returns {XMLList|XML}
     */
    function getCurrentUser() {
      return angular.copy(currentUser); // To prevent external modification
    }

    /**
     *
     * @param user
     */
    function setCurrentUser(user) {
      devlog.channel('iscSessionModel').debug('iscSessionModel.setCurrentUser');
      devlog.channel('iscSessionModel').debug('...user: ' + angular.toJson(user));
      currentUser = angular.copy(user); // To prevent external modificiation
    }

    // --------------
    /**
     *
     * @returns {*}
     */
    function getCurrentUserRole() {
      return _.get(currentUser, "userRole");
    }

    // --------------
    /**
     *
     * @returns {boolean}
     */
    function isAuthenticated() {
      //devlog.channel('iscSessionModel').debug('iscSessionModel.isAuthenticated', currentUser);
      // '*' denotes anonymous user (AKA not authenticated)
      return _.get(currentUser, 'userRole', '*') !== '*';
    }

    // --------------
    /**
     *
     * @returns {string}
     */
    function getFullName() {
      devlog.channel('iscSessionModel').debug('iscSessionModel.getFullName');
      return !!currentUser ? currentUser.FullName : '';
    }

    function _logTimer() {
      devlog.channel('iscSessionModel').debug('...sessionTimeout.expireAt', sessionTimeout.expireAt, "(" + _.getRemainingTime(sessionTimeout.expireAt) + "s remaining)");
      devlog.channel('iscSessionModel').debug('...sessionTimeout.warnAt', sessionTimeout.warnAt, "(" + _.getRemainingTime(sessionTimeout.warnAt) + "s remaining)");
    }
  }// END CLASS


})();

