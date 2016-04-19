/**
 * Created by douglas goodman on 10/30/15.
 */

(function () {
  'use strict';
  // ----------------------------
  // injection
  // ----------------------------

  angular.module ('iscNavContainer')
      .factory ('iscLanguageService', iscLanguageService);

  // --------------------
  // INPLEMENTATION DETAILS
  // --------------------

  /**
   * @ngdoc factory
   * @memberOf iscNavContainer
   * @param devlog
   * @param $window
   * @param $translate
   * @param iscCustomConfigService
   * @param iscSessionStorageHelper
   * @returns {{showDropDown: showDropDown, getLanguages: getLanguages, getSelectedLanguage: getSelectedLanguage}}
     */
  /* @ngInject */
  function iscLanguageService (devlog, $window, $translate, iscCustomConfigService, iscSessionStorageHelper) {
    var channel = devlog.channel('iscLanguageService');
    
    channel.debug( 'iscLanguageService LOADED');

    // ----------------------------
    // vars
    // ----------------------------

    var languages;
    var showLanguageDropDown = false;
    var selectedLanguage = null;
    var initIsDone = false;

    // ----------------------------
    // class factory
    // ----------------------------
    var service = {
      showDropDown: showDropDown,
      getLanguages: getLanguages,
      getSelectedLanguage: getSelectedLanguage
    };


    return service;

    // ----------------------------
    // functions
    // ----------------------------
    /**
     * @memberOf iscLanguageService
     * @returns {*}
       */
    function getLanguages () {
      if (!initIsDone) {
        doInit ();
      }
      return languages;
    }

    /**
     * @memberOf iscLanguageService
     * @returns {boolean}
       */
    function showDropDown () {
      if (!initIsDone) {
        doInit ();
      }

      return showLanguageDropDown;
    }

    /**
     * @memberOf iscLanguageService
     * @returns {*}
       */
    function getSelectedLanguage () {
      if (!initIsDone) {
        doInit ();
      }

      return selectedLanguage;
    }

    /**
     * @memberOf iscLanguageService
     */
    function doInit () {

      languages = iscCustomConfigService.getConfigSection ('languageList');

      if (languages) {

        if (languages.length > 1) {
          showLanguageDropDown = true;

          var currentLanguage = iscSessionStorageHelper.getValFromSessionStorage ('currentLanguage');

          if (!!currentLanguage) {
            selectedLanguage = currentLanguage;
          }
          else {

            var lang = $window.navigator.language || $window.navigator.userLanguage;
            selectedLanguage = languages[ 0 ];

            _.forEach (languages, function (language) {

              var myFileName = language.fileName.toUpperCase ();
              var myLang = lang.toUpperCase ();

              if (myFileName === myLang) {
                selectedLanguage = language;
                //console.log('selected full match ', selectedLanguage);
                return false;
              }
              else if (myFileName.indexOf (myLang) !== -1) {
                selectedLanguage = language;
                //console.log('selected partial match ', selectedLanguage);
                return false;
              }
            });
          }

          $translate.use (selectedLanguage.fileName);

          initIsDone = true;
        }
      }
    }
    // ----------------------------

  }//END CLASS




}) ();
