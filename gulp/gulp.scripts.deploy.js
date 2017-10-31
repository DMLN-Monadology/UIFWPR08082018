/**
 * Created by hzou on 3/3/16.
 */


var inject = require('gulp-inject');

module.exports = {
  init: init
};

function init( gulp, plugins, config, _, util ) {
  "use strict";
  var argv           = require( 'yargs' ).argv;
  var configOverride = argv.config;


  gulp.task('scripts:deploy', function () {
    // Retrieves the version info set during gulp version
    var release = _.get( config.app, 'appVersion.release' ),
        build   = _.get( config.app, 'appVersion.build' ),
        change  = _.get( config.app, 'appVersion.change' );

    var configPaths = ["vendor.js",
      "module.assets.vendor.js",
      "module.modules",
      "module.js"];

    var jsSrc = [];
    _.forEach(configPaths, function (configPath) {
      jsSrc.push(_.get(config.common, configPath, []));
      jsSrc.push(_.get(config.component, configPath, []));
      if(configPath.endsWith('modules') && configOverride){
        jsSrc.push(configOverride);
        jsSrc.push(config.app.excludeConfig);
      }
      jsSrc.push(_.get(config.app, configPath, []));
    });

    jsSrc = _.chain(jsSrc)
      .flatten(jsSrc)
      .concat(config.masterConfig.overrides.common)
      .concat(config.masterConfig.overrides.components)
      .concat(_.map(config.app.module.tests, function(testGlob){
        return "!"+testGlob;
      })).compact().value();

    return gulp.src( jsSrc )
      // .pipe( plugins.filelog() )
      .pipe( plugins.ngAnnotate() )
      .pipe( plugins.concat( 'app.min.js' ) )
      // sets the version in the runtime config from the build config
      .pipe( plugins.replace( '%appVersion.release%', release ) )
      .pipe( plugins.replace( '%appVersion.build%', build ) )
      .pipe( plugins.replace( '%appVersion.change%', change ) )
      .pipe( plugins.uglify() )
      .pipe( gulp.dest( plugins.path.join( config.app.dest.folder, 'js' ) ) );

  });

}