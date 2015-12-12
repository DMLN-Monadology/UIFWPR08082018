/**
 * Created by douglas goodman on 3/9/15.
 */

(function () {
  'use strict';
  /* @ngInject */
  function iscStateManager(devlog, $state, iscCustomConfigHelper) {
    devlog.channel('iscStateManager').debug('iscStateManager.LOADED');

    // ----------------------------
    // vars
    // ----------------------------

    // when you select a mail message from, say, the inbox
    // we want the subnav for inbox to still be highlighted
    var parentSref = '';


    // ----------------------------
    // class factory
    // ----------------------------
    var service = {
      setParentSref                : setParentSref,
      isCurrentState               : isCurrentState,
      getCurrentStateTranslationKey: getCurrentStateTranslationKey,
      isInbox                      : isInbox,
      isOutbox                     : isOutbox
    };

    return service;

    // ----------------------------
    // functions
    // ----------------------------

    /**
     * Used instead of the iscCustomConfigHelper.isCurrentState() for those
     * cases where the user has navigated to a sub-url
     * but what is highlighted in the secondary nav should still be the parent state
     * for example, when one clicks on a message from the inbox, one goes
     * to a url/page for that message, but in the secondary nav, 'inbox' is still highlighted
     *
     * @param stateName String
     * @returns {boolean}
     */
    function isCurrentState(stateName) {
      var retVal = $state.is(stateName) || stateName === parentSref;

      //if( stateName === 'index.messages.inbox'){
      //  devlog.channel('iscStateManager').debug( 'iscStateManager.isCurrentState: ', stateName );
      //  devlog.channel('iscStateManager').debug( '......parentSref: ', parentSref);
      //  devlog.channel('iscStateManager').debug( '.........current: ', $state.$current.name );
      //  devlog.channel('iscStateManager').debug( '..........retVal: ', retVal);
      //}

      return retVal;
    }

    function setParentSref(val) {
      parentSref = val;
    }

    // is a state either inbox or archivedInbox?
    function isInbox(stateName) {
      devlog.channel('iscStateManager').debug('iscStateManager.isInbox: ', stateName);
      return stateName.toLowerCase().indexOf('inbox') > -1;
    }

    // is a state either outbox or archivedOutbox?
    function isOutbox(stateName) {
      devlog.channel('iscStateManager').debug('iscStateManager.isOutbox: ', stateName);
      return stateName.toLowerCase().indexOf('outbox') > -1;
    }

    /**
     * Used instead of the iscCustomConfigHelper.getCurrentStateTranslationKey()
     * for those cases where the user has navigated to a sub-url
     * but what is highlighted in the secondary nav should still be the parent state
     * for example, when one clicks on a message from the inbox, one goes
     * @returns translationKey (String)
     */
    function getCurrentStateTranslationKey() {
      if (parentSref) {
        return iscCustomConfigHelper.getTranslationKeyFromName(parentSref);
      }

      return iscCustomConfigHelper.getCurrentStateTranslationKey();
    }


  }//END CLASS


  // ----------------------------
  // injection
  // ----------------------------

  angular.module('isc.stateManager', [])
    .factory('iscStateManager', iscStateManager);

})();

