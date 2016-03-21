(function () {
  'use strict';

  angular.module('isc.forms')
    .factory('iscFormDataApi', iscFormDataApi);

  /* @ngInject */
  function iscFormDataApi(devlog, apiHelper, iscHttpapi) {
    var url = apiHelper.getUrl('formData/');

    var api = {
      get   : get,
      put   : put,
      post  : post,
      delete: deleteApi,
      list  : list
    };

    return api;

    function get(id) {
      devlog.channel('iscFormDataApi').debug('iscFormDataApi.get');
      return iscHttpapi.get(url + id);
    }

    function put(id, form) {
      devlog.channel('iscFormDataApi').debug('iscFormDataApi.put');
      return iscHttpapi.put(url + id, form);
    }

    function post(form) {
      devlog.channel('iscFormDataApi').debug('iscFormDataApi.post');
      return iscHttpapi.post(url, form);
    }

    function deleteApi(id) {
      devlog.channel('iscFormDataApi').debug('iscFormDataApi.delete');
      return iscHttpapi.delete(url + id);
    }

    function list() {
      devlog.channel('iscFormDataApi').debug('iscFormDataApi.list');
      return iscHttpapi.get(url);
    }

  }
})();
