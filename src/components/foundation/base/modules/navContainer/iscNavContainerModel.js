/**
 * Created by dgoodman on 2/3/15.
 */

( function() {
  'use strict';

  // ----------------------------
  // injection
  // ----------------------------

  angular.module( 'iscNavContainer' )
    .factory( 'iscNavContainerModel', iscNavContainerModel );

  /**
   * @ngdoc factory
   * @memberOf iscNavContainer
   * @param devlog
   * @param $state
   * @param iscCustomConfigService
   * @param iscSessionModel
   * @returns {{getTopNav: getTopNav, getVersionInfo: getVersionInfo, setVersionInfo: setVersionInfo, navigateToUserLandingPage: navigateToUserLandingPage}}
   */
  function iscNavContainerModel( devlog, $state, iscCustomConfigService, iscSessionModel, $window, $timeout ) {
    var channel = devlog.channel( 'iscNavContainerModel' );
    channel.debug( 'iscNavContainerModel LOADED' );

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

      getTopNav                : getTopNav,

      getVersionInfo           : getVersionInfo,
      setVersionInfo           : setVersionInfo,

      navigateToUserLandingPage: navigateToUserLandingPage
    };

    return model;

    // ----------------------------
    // functions
    // ----------------------------
    /**
     * @memberOf iscNavContainerModel
     */
    function navigateToUserLandingPage( reload ) {
      var currentUserRole = iscSessionModel.getCurrentUserRole();
      var landingPage     = iscCustomConfigService.getConfigSection( 'landingPages' )[currentUserRole];
      if ( !_.isNil( landingPage ) ) {
        var currentState = $state.current.state;
        $state.go( landingPage );
        // do a full page reload if `reload` flag is passed in
        // or if user role is anonymous ("*") and is going to the user's landing page
        if ( reload || ( currentState !== landingPage && currentUserRole === "*" ) ) {
          $window.sessionStorage.setItem( 'isAutoLogOut', true );
          $timeout( function() {
            $window.location.reload();
          }, 0 );
        }
      } else {
        channel.error( 'No landing page found for', _.wrapText( currentUserRole ), 'role' );
      }
    }

    /**
     * @memberOf iscNavContainerModel
     * @returns {*}
     */
    function getTopNav() {
      var currentUserRole = iscSessionModel.getCurrentUserRole();
      if ( !topNavArr[currentUserRole] ) {
        var topTabs  = iscCustomConfigService.getConfigSection( 'topTabs' );
        var userTabs = _.extend( {}, topTabs['*'] ); // include anonymous tabs
        if ( currentUserRole !== '*' ) {
          _.extend( userTabs, topTabs[currentUserRole] );
        }

        topNavArr[currentUserRole] = _.toArray( userTabs );
      }

      return topNavArr[currentUserRole];
    }

    /**
     * @memberOf iscNavContainerModel
     * @returns {*}
     */
    function getVersionInfo() {
      return versionInfo;
    }

    /**
     * @memberOf iscNavContainerModel
     * @param val
     */
    function setVersionInfo( val ) {
      versionInfo = val;
    }
  }//END CLASS

} )();

