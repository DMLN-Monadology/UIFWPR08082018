/**
 * This config.app.js is now responsible for aggregating the common and component configurations.
 *
 * This config file now has full power and can modify the contents of config.common.js and config.component.js.
 *
 * This is very powerful because individual application no longer needs to rely on gulpfile to create custom logic
 * to handle things like edition support, overrides (the existing approach still works). This config.app.js file
 * can now read multiple edition configs and update ```module.exports.component``` configuration directly.
 */
module.exports.masterConfig = {};
module.exports.common       = require( "./config.common" );
module.exports.component    = require( "../src/components/foundation/base/config.components" );
module.exports.app          = {
  "modulePath"    : "src/app/modules/",
  "vendor"        : {
    "js"    : [],
    "mocks" : [],
    "fonts" : []
  },
  "module"        : {
    "modules" : [
      "src/app/modules/**/app.module.js",
      "src/app/modules/**/*.module.js"
    ],
    "js"      : [
      "src/app/modules/**/*.js"
    ],
    "scss"    : [
      "src/app/assets/sass/main.scss",
      "src/app/modules/**/*.scss"
    ],
    "html"    : [
      "src/app/modules/**/*.html"
    ],
    "assets"  : {
      "i18nDir"    : "src/app/assets/i18n/",
      "comments"   : "i18nDomain value will be used as a part of the generated i18n xml",
      "i18nDomain" : "HSPortal",
      "mocks"      : [
        "src/app/assets/mockData/**"
      ],
      "images"     : [
        "src/app/assets/images/**/*"
      ],
      "vendor"     : {
        "js" : []
      }
    },
    "mocks"   : [
    ],
    "tests"   : [
      "test/unit/app/**/*.test.js",
      "test/unit/app/**/*Tests.js"
    ]
  },
  "dest"          : {
    "folder"   : "www",
    "html"     : "src/index.html",
    "css"      : "src/app/assets/sass/main.scss",
    "js"       : "src/app/assets/sass/main.js",
    "comments" : "i18nXml is used for specifying destination location of converted i18n files",
    "i18nXml"  : "www/assets/i18n"
  },
  "cordova"       : false,
  "excludeConfig" : "!src/app/modules/app.config.js",
  "edition"       : [
    {
      "name" : "base",
      "path" : "src/components/foundation/base/config.components.js"
    }
  ],
  "comments"      : "JavaScript files can't be overridden like css selector cascading or Angular's templateCache templates.",
  "comments"      : "If we want to override lower level JS files, we must exclude them from the list.",
  "comments"      : "The overrides below are used to exclude base files by specifying glob patterns.",
  "comments"      : "e.g. ```common: ['!src/modules/isc.filters/myFilter.js']```",
  "comments"      : "update: common and components config can now be directly modified by this file.",
  "overrides"     : {
    "js"       : {
      "common"     : [],
      "components" : []
    },
    "comments" : "Used to exclude files in common/component. e.g. ```common: ['!src/modules/isc.filters/myFilter.html']```",
    "html"     : {
      "common"     : [],
      "components" : []
    }
  }
};
