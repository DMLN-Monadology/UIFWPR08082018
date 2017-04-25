( function() {
  'use strict';
  /*
   * oauth module
   *
   * To configure oauth, the below properties are required and must be configured externally:
   *    {
   *      'oauthBaseUrl'  : 'http://hscpdev1.iscinternal.com:57772/oauth'
   *      'client'        :  Base-64-encode( clientId : clientSecret ),
   *      'aud'           : "https://hscpdev1.iscinternal.com/csp/healthshare/hsfhiraccess/fhiraccessoauth"
   *    }
   *
   * It can be configured via the ways below:
   *   1. Specified in app.Config :
   *        appConfig : {
   *        ...
   *         'oauth' : {
   *              'oauthBaseUrl'  : 'http://hscpdev1.iscinternal.com:57772/oauth'
   *              'client'        : Base-64-encode( clientId : clientSecret ),
   *              'aud'           : "https://hscpdev1.iscinternal.com/csp/healthshare/hsfhiraccess/fhiraccessoauth"
   *         }
   *        }
   *
   *   2. Custom config url specified in appConfig which returns the JSON below :
   *        {
   *         'oauth' : {
   *              'oauthBaseUrl'  : 'http://hscpdev1.iscinternal.com:57772/oauth',
   *              'client'        : Base-64-encode( clientId : clientSecret ),
   *              'aud'           : "https://hscpdev1.iscinternal.com/csp/healthshare/hsfhiraccess/fhiraccessoauth"
   *         }
   *        }
   *   3. FHIR based where oauth base url is provided by FHIR metadata and other properties are specified in appConfig
   *        appConfig : {
   *        ...
   *         'oauth' : {
   *              'client'        : Base-64-encode( clientId : clientSecret ),
   *              'aud'           : "https://hscpdev1.iscinternal.com/csp/healthshare/hsfhiraccess/fhiraccessoauth"
   *         }
   *        }
   *   4. Custom config url in appConfig  which returns FHIR server url and oauth properties JSON
   *        {
   *         'fhir' : {
   *              'iss'    : 'http://hscpdev1.iscinternal.com:57772/fhirserver',
   *              'client' : Base-64-encode( clientId : clientSecret ),
   *              'aud'    : "https://hscpdev1.iscinternal.com/csp/healthshare/hsfhiraccess/fhiraccessoauth"
   *         }
   *        }
   * */
  angular.module( 'isc.oauth', ['angular-md5'] );

} )();

