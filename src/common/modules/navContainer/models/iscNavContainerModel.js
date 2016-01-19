/**
 * Created by dgoodman on 2/3/15.
 */

(function () {
  'use strict';

  // ----------------------------
  // injection
  // ----------------------------

  angular.module('iscNavContainer')
    .factory('iscNavContainerModel', iscNavContainerModel);

  function iscNavContainerModel(devlog, $state, iscCustomConfigService, iscSessionModel) {
    devlog.channel('iscNavContainerModel').debug('iscNavContainerModel LOADED');

    // ----------------------------
    // vars
    // ----------------------------
    var topNavArr = {};
    var secondaryNav;
    var secondaryNavTasks;
    var versionInfo;


    // ----------------------------
    // class factory
    // ----------------------------
    var model = {

      getTopNav: getTopNav,

      getSecondaryNav: getSecondaryNav,
      setSecondaryNav: setSecondaryNav,

      getVersionInfo : getVersionInfo,
      setVersionInfo : setVersionInfo,

      getSecondaryNavTasks: getSecondaryNavTasks,
      setSecondaryNavTasks: setSecondaryNavTasks,
      hasSecondaryNavTasks: hasSecondaryNavTasks,

      navigateToUserLandingPage: navigateToUserLandingPage
    };

    return model;

    // ----------------------------
    // functions
    // ----------------------------

    function navigateToUserLandingPage() {
      var currentUserRole = iscSessionModel.getCurrentUserRole();
      var landingPage     = iscCustomConfigService.getConfigSection('landingPages')[currentUserRole];
      $state.go(landingPage);
    }

    function getTopNav() {
      var currentUserRole = iscSessionModel.getCurrentUserRole();
      if (!topNavArr[currentUserRole]) {
        var topTabs  = iscCustomConfigService.getConfigSection('topTabs');
        var userTabs = _.extend({}, topTabs['*']); //show all tabs that's for anonymous
        if (currentUserRole !== '*') {
          _.extend(userTabs, topTabs[currentUserRole]);
          topNavArr[currentUserRole] = _.toArray(userTabs);
        }
      }
      return topNavArr[currentUserRole];
    }

    function getSecondaryNav() {
      devlog('iscNavContainerModel').debug('getSecondaryNav');
      return secondaryNav;
    }

    function setSecondaryNav(val) {
      devlog('iscNavContainerModel').debug('setSecondaryNav');
      secondaryNav = val;
    }

    function getVersionInfo() {
      return versionInfo;
    }

    function setVersionInfo(val) {
      versionInfo = val;
    }

    function getSecondaryNavTasks() {
      devlog('iscNavContainerModel').debug('getSecondaryNavTasks');
      return secondaryNavTasks;
    }

    function setSecondaryNavTasks(val) {
      devlog('iscNavContainerModel').debug('setSecondaryNavTasks');
      secondaryNavTasks = val;
    }

    function hasSecondaryNavTasks() {
      return !!secondaryNavTasks && secondaryNavTasks.length > 0;
    }

  }//END CLASS


})();

