// Mock components
var mockApiHelper = {
  getUrl      : function (path) {
    return path;
  },
  getConfigUrl: function (configProp) {
    return configProp.path;
  }
};

var mockCustomConfigService = {
  getConfig: function () {
    return customConfig;
  }
};
