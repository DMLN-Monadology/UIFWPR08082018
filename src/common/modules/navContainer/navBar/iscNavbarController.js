(function () {
  'use strict';

  // ------------------------------------------
  // module injection
  // ------------------------------------------
  angular.module('iscNavContainer')
    .controller('iscNavbarController', iscNavbarController);

  /* @ngInject */
  function iscNavbarController(
    devlog, $scope, $state, $rootScope, loginApi, $window,
    iscCustomConfigService, iscCustomConfigHelper, iscUiHelper, iscSessionModel,
    AUTH_EVENTS
  ) {

    devlog.channel('iscNavbarController').debug('iscNavbarController LOADED');

    var self = this;

    angular.extend(self, {
      iscUiHelper  : iscUiHelper,
      configService: iscCustomConfigService,
      sessionModel : iscSessionModel,

      sectionTranslationKey: '',
      showLogin            : false,
      showLogout           : false,
      isAuthenticated      : false,
      showRoles            : false,

      tabs        : _.toArray(iscCustomConfigService.getConfigSection('topTabs.*')),
      logoutButton: iscCustomConfigService.getConfigSection('logoutButton'),
      loginButton : iscCustomConfigService.getConfigSection('loginButton'),
      userRoles   : [],

      logout            : logout,
      changeRole        : changeRole,
      setShowLogin      : setShowLogin,
      setShowLogout     : setShowLogout,
      setShowRoles      : setShowRoles,
      setIsAuthenticated: setIsAuthenticated,
      setPageState      : setPageState,
      setTabActiveState : setTabActiveState
    });

    setIsAuthenticated();
    setShowLogin();
    setShowLogout();
    setShowRoles();

    function changeRole() {
      devlog.channel('iscNavbarController').debug('calling changeRole)');
      loginApi.changeRole(self.user.userRole).then(_loginSuccess);

      function _loginSuccess(responseData) {
        var name    = responseData.UserData.Name;
        var session = _.extend(responseData, { SessionTimeout: responseData.sessionInfo.remainingTime });
        _.extend(responseData.UserData, {
          userRole: responseData.ApplicationRole,
          FullName: [name.GivenName, name.FamilyName].join(" ")
        });

        // Create a session for timeout testing purposes
        iscSessionModel.create(session, true);

        // Saving session.id here to test/demonstrate scope of sessionStorage
        $window.sessionStorage.setItem('sessionId', session.sessionId);
      }
    }

    function logout() {
      devlog.channel('iscNavbarController').debug('iscNavbarController.logout');
      $rootScope.$emit(AUTH_EVENTS.logout);
    }

    function setIsAuthenticated() {
      devlog.channel('iscNavbarController').debug('iscNavbarController.isAuthenticated');

      self.isAuthenticated = iscSessionModel.isAuthenticated();
    }

    function setShowRoles() {
      devlog.channel('iscNavbarController').debug('iscNavbarController.isAuthenticated');
      self.user      = iscSessionModel.getCurrentUser();
      self.userRoles = _.get(self.user, 'Roles', [self.user.userRole]);
      self.showRoles = self.userRoles.length > 1;
    }

    function setShowLogin() {
      devlog.channel('iscNavbarController').debug('iscNavbarController.showLogin');

      var loggedIn    = iscSessionModel.isAuthenticated();
      var isLoginPage = $state.is('index.login');

      self.showLogin = !loggedIn && !isLoginPage;
    }

    function setShowLogout() {
      devlog.channel('iscNavbarController').debug('iscNavbarController.showLoout');

      var loggedIn    = self.sessionModel.isAuthenticated();
      var isLoginPage = $state.is('index.login');
      self.showLogout = loggedIn && !isLoginPage;
    }

    function setPageState(name) {
      self.setTabActiveState(name);
      self.sectionTranslationKey = iscCustomConfigHelper.getSectionTranslationKeyFromName(name);
    }

    function setTabActiveState(state) {
      devlog.channel('iscNavbarController').debug('iscNavbarController.setTabActiveState');
      self.iscUiHelper.setTabActiveState(state, self.tabs);
    }

    // -----------------------------
    // listeners
    // -----------------------------

    $rootScope.$on('$stateChangeSuccess',
      function (event, toState, toParams, fromState, fromParams) {

        devlog.channel('iscNavbarController').debug('iscNavbarController.$stateChangeSuccess', arguments);
        self.setPageState(toState.name);
        self.setShowLogout();
        self.setShowLogin();
        self.setIsAuthenticated();
        self.setShowRoles();
      });

    // login success event
    $rootScope.$on(AUTH_EVENTS.loginSuccess, function () {
      devlog.channel('iscNavbarController').debug('iscNavbarController.$loginSuccess', arguments);
      devlog.channel('iscNavbarController').debug('..updating top level navs');

      updateNavBasedOnRole();
    });

    $rootScope.$on(AUTH_EVENTS.notAuthorized, function () {
      devlog.channel('iscNavbarController').debug('iscNavbarController.notAuthorized', arguments);
      devlog.channel('iscNavbarController').debug('..updating top level navs');

      updateNavBasedOnRole();
    });

    // logout success event
    $rootScope.$on(AUTH_EVENTS.logoutSuccess, function () {
      devlog.channel('iscNavbarController').debug('iscNavbarController.logoutSuccess', arguments);
      devlog.channel('iscNavbarController').debug('..updating top level navs');

      updateNavBasedOnRole();
    });

    function updateNavBasedOnRole() {
      var currentUser = iscSessionModel.getCurrentUser();
      var userRole    = currentUser.userRole;

      //what pages are authorized?
      var routes           = iscCustomConfigService.getConfigSection("rolePermissions");
      var authorizedRoutes = [].concat(routes["*"]); //show all routes that's for anonymous
      if (userRole !== "*") {
        authorizedRoutes = authorizedRoutes.concat(routes[userRole]);
      }
      iscSessionModel.setAuthorizedRoutes(authorizedRoutes, true);

      //which top nav to show?
      var topTabs     = iscCustomConfigService.getConfigSection('topTabs');
      var visibleTabs = _.extend({}, topTabs["*"]); //show all tabs that's for anonymous
      if (userRole !== "*") {
        _.extend(visibleTabs, topTabs[userRole]);
      }
      self.tabs = _.toArray(visibleTabs);

      var landingPage = iscCustomConfigService.getConfigSection('landingPages')[userRole];

      self.setShowLogout();
      self.setShowLogin();
      self.setIsAuthenticated();
      self.setShowRoles();

      $state.go(landingPage);
    }

    // when you refresh the page, this will reset the active state of the selected tab
    $scope.$evalAsync(function () {
      devlog.channel('iscNavbarController').debug('iscNavbarController setting page name to', $state.$current.name);
      self.setPageState($state.$current.name);
    });


  } // END CLASS


})();


