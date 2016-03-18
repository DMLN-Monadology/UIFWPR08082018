/**
 * Created by hzou on 12/30/15.
 */

(function () {
  'use strict';

  angular
    .module('isc.authorization')
    .factory('iscAuthorizationModel', iscAuthorizationModel);

  /*========================================
   =                 FACTORY                =
   ========================================*/

  function iscAuthorizationModel(devlog, iscSessionModel, iscCustomConfigService) {
    var authorizedRoutes = {};

    var service = {
      isAuthorized: isAuthorized
    };
    return service;

    function isAuthorized(stateToCheck) {
      devlog.channel('iscAuthorizationModel').debug('iscAuthorizationModel.isAuthorized..');
      var currentUserRole      = iscSessionModel.getCurrentUserRole();
      var authorizedUserRoutes = getAuthorizedRoutes(currentUserRole);
      stateToCheck             = stateToCheck || '';
      var isPermitted;
      if (isBlackListed(stateToCheck, authorizedUserRoutes)) {
        isPermitted = false;
      } else {
        isPermitted = isWhiteListed(stateToCheck, authorizedUserRoutes);
      }

      devlog.channel('iscAuthorizationModel').debug('is user authorized for', stateToCheck, '=>', !!isPermitted);
      return !!isPermitted;
    }


    /*========================================
     =                 PRIVATE                =
     ========================================*/

    /**
     * This function takes an array of permitted states.
     * and maps it to an role based nested object representation for fast checking
     *
     * For Example:
     * Current UseRole: '*' //anonymous
     * Input: ['index', 'index.home', 'index.patient.*', '!index.patient.admin']
     * Output:  {'*': { '!index': { patient: { admin: {} } }, index: { home: {}, patient: { '*': {} } } } }
     *
     * NOTE: states beginning with '!' denotes they are black listed.
     * @param permittedRoutes
     * @returns {{}}
     */
    function mapAuthorizedUserRoute(userRole) {
      devlog.channel('iscAuthorizationModel').debug('iscAuthorizationModel.mapAuthorizedUserRoute for', userRole);
      var rolePermissions = iscCustomConfigService.getConfigSection('rolePermissions');
      var permittedRoutes = rolePermissions[userRole] || [];

      if (!authorizedRoutes[userRole]) {
        authorizedRoutes[userRole] = (userRole === '*') ? {} : angular.copy(authorizedRoutes['*']); //get everything from anonymous
      }
      permittedRoutes.forEach(function (state) {  //maps an array into object
        if (!_.get(authorizedRoutes[userRole], state)) {
          _.set(authorizedRoutes[userRole], state, {});
        }
      });
    }

    function getAuthorizedRoutes(currentUserRole) {
      devlog.channel('iscAuthorizationModel').debug('iscAuthorizationModel.getAuthorizedRoutes..');

      if (!authorizedRoutes['*']) { //anonymous user routes
        mapAuthorizedUserRoute('*');
      }
      if (!authorizedRoutes[currentUserRole]) {
        mapAuthorizedUserRoute(currentUserRole);
      }

      return authorizedRoutes[currentUserRole];
    }

    function isBlackListed(stateToCheck, authorizedUserRoutes) {
      devlog.channel('iscAuthorizationModel').debug('iscAuthorizationModel.isBlackListed..');
      var blacklisted = authorizedUserRoutes['!*'] || _.get(authorizedUserRoutes, '!' + stateToCheck, false);
      return blacklisted || hasWildCardMatch(stateToCheck, authorizedUserRoutes, true);
    }

    function isWhiteListed(stateToCheck, authorizedUserRoutes) {
      devlog.channel('iscAuthorizationModel').debug('iscAuthorizationModel.isWhiteListed..');
      var blacklisted = authorizedUserRoutes['*'] || _.get(authorizedUserRoutes, stateToCheck, false);
      return blacklisted || hasWildCardMatch(stateToCheck, authorizedUserRoutes, false);
    }

    /**
     *
     * This function will take a ui.router state (in the format 'index.xxx.yyy.zzz') and
     * checks against a list of white/black listed items (including wild cards).
     * For each of the state parts ['index', 'xxx', 'yyy', 'zzz'], it will build a wild card string
     * to check against the authorizedStates. Example:
     *
     * FOR WHITE LIST
     * 1] 'index.*'
     * 2] 'index.xxx.*',
     * 3] 'index.xxx.yyy.*',
     * 4] 'index.xxx.yyy.zzz.*'
     *
     * FOR BLACK LIST
     * 1] '!index.*'
     * 2] '!index.xxx.*',
     * 3] '!index.xxx.yyy.*',
     * 4] '!index.xxx.yyy.zzz.*'
     *
     * @param stateToCheck -- the state to navigate to
     * @param authorizedStates -- the master list of all permitted states
     * @param checkBlacklisted -- indicate whether this is to check against black list or white list
     * @returns {boolean} -- indicates if there's matching found
     */
    function hasWildCardMatch(stateToCheck, authorizedUserRoutes, checkBlacklisted) {
      devlog.channel('iscAuthorizationModel').debug('iscAuthorizationModel.hasWildCardMatch..');
      var tokens = stateToCheck.split('.');
      var path   = checkBlacklisted ? '!' : '';

      return _.some(tokens, function (token) {
        path += token + '.';
        return _.get(authorizedUserRoutes, path + '*', false);
      });
    }

  }// END CLASS

})();
