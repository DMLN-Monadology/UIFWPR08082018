( function() {
  'use strict';

  /* @ngInject */
  angular
    .module( 'isc.notification' )
    .factory( 'iscNotificationService', iscNotificationService );

  /**
   * @ngdoc factory
   * @memberOf isc.notification
   * @param FoundationApi
   * @param NOTIFICATION
   * @returns {{init: init, setDefaults: setDefaults, registerFieldScope: registerFieldScope, getFieldScope: getFieldScope, showAlert, showWarning, showSuccess, showDark}}
   */
  function iscNotificationService( FoundationApi, NOTIFICATION ) {
    var defaults = {};

    var fieldScope = {};

    var showAlert   = _.partial( show, NOTIFICATION.type.alert ),
        showWarning = _.partial( show, NOTIFICATION.type.warning ),
        showSuccess = _.partial( show, NOTIFICATION.type.success ),
        showDark    = _.partial( show, NOTIFICATION.type.dark );

    return {
      setDefaults         : setDefaults,
      registerFieldScope  : registerFieldScope,
      deregisterFieldScope: deregisterFieldScope,
      getFieldScope       : getFieldScope,

      showAlert         : showAlert,
      showWarning       : showWarning,
      showSuccess       : showSuccess,
      showDark          : showDark
    };

    /**
     * @memberOf iscNotificationService
     * @param scope
     */
    function registerFieldScope( scope ) {
      fieldScope[scope.id] = scope;
    }

    /**
     * @memberOf iscNotificationService
     * @param scope
     */
    function deregisterFieldScope( scope ) {
      delete fieldScope[scope.id];
    }

    /**
     * @memberOf iscNotificationService
     * @param id
     * @returns {*}
     */
    function getFieldScope( id ) {
      return _.get( fieldScope, id, {} );
    }

    /**
     * @memberOf iscNotificationService
     * @description
     * Sets default options for notifications from the configuration object.
     * @param {Object} config - position (const), type (const), autoclose (number)
     */
    function setDefaults( config ) {
      _.merge( defaults, config );
    }

    /**
     * @memberOf iscNotificationService
     * @description
     * Shows a notification with the configured parameters.
     * @param {string} type (const)
     * @param {Object} config:
     * title (string or html), content (string or html), autoclose (number), position (const), scrollTo (element id)
     *
     * Some form-specific config properties are also supported:
     * $error (ng-validation $error hash), options (formly scope options)
     */
    function show( type, config ) {
      FoundationApi.publish(
        config.id ? config.id : 'isc-notifications-' + ( config.position || defaults.position ),
        {
          title    : config.title,
          content  : config.content,
          autoclose: config.persist ? undefined : ( config.autoclose || defaults.autoclose ),
          color    : type || defaults.type,
          scrollTo : config.scrollTo,

          // form-specific notification properties
          $error   : config.$error,
          options  : config.options
        }
      );
    }
  }
} )();
