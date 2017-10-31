/**
 * Created by hzou on 3/3/16.
 */

module.exports = {
  init: init
};

function init( gulp, plugins, config, _, util ) {
  var argv           = require( 'yargs' ).argv;
  var configOverride = argv.config;

  gulp.task('scripts:vendor', function () {
    var vendors = _.concat(config.common.vendor.js,
      config.component.vendor.js,
      config.app.vendor.js,
      config.common.module.assets.vendor.js,
      config.component.module.assets.vendor.js,
      config.app.module.assets.vendor.js);

    return gulp.src(vendors)
      .pipe(util.getPlumber())
      //.pipe(plugins.filelog())
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.concat('1.vendor.min.js'))
      .pipe(plugins.sourcemaps.write('.'))
      // .pipe(plugins.bytediff.start())
      // .pipe(plugins.uglify())
      // .pipe(plugins.bytediff.stop())
      .pipe(gulp.dest(plugins.path.join(config.app.dest.folder, 'js')));
  });

  gulp.task('scripts:common', function () {
    var src = _.concat(config.common.module.modules,
      config.common.module.js,
      config.masterConfig.overrides.js.common);

    return gulp.src(src)
      .pipe(util.getPlumber())
      //.pipe(plugins.filelog())
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.ngAnnotate())
      .pipe(plugins.concat('3.common.min.js'))
      // .pipe(plugins.bytediff.start())
      // .pipe(plugins.uglify())
      // .pipe(plugins.bytediff.stop())
      .pipe(plugins.sourcemaps.write('.'))
      .pipe(gulp.dest(plugins.path.join(config.app.dest.folder, 'js')));
  });

  gulp.task('scripts:components', function () {
    var src = _.concat(
      config.component.module.modules,
      config.component.module.js,
      config.masterConfig.overrides.js.components);

    return gulp.src(src)
      .pipe(util.getPlumber())
      //.pipe(plugins.filelog())
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.ngAnnotate())
      .pipe(plugins.concat('5.components.min.js'))
      // .pipe(plugins.bytediff.start())
      // .pipe(plugins.uglify())
      // .pipe(plugins.bytediff.stop())
      .pipe(plugins.sourcemaps.write('.'))
      .pipe(gulp.dest(plugins.path.join(config.app.dest.folder, 'js')));
  });

  gulp.task('scripts:app', function () {
    // Retrieves the version info set during gulp version
    var release = _.get( config.app, 'appVersion.release' ),
        build   = _.get( config.app, 'appVersion.build' ),
        change  = _.get( config.app, 'appVersion.change' );

    var src = [];
    if ( configOverride ) {
      src.push( configOverride );
      src.push( config.app.excludeConfig );
    }
    src = _.concat( src, config.app.module.modules, config.app.module.js, _.map( config.app.module.tests, function( testGlob ) {
      return "!" + testGlob;
    } ) );

    return gulp.src( src )
      .pipe( util.getPlumber() )
      // .pipe( plugins.filelog() )
      .pipe( plugins.sourcemaps.init() )
      .pipe( plugins.ngAnnotate() )
      .pipe( plugins.concat( '7.app.min.js', { newLine: ';' } ) )
      // sets the version in the runtime config from the build config
      .pipe( plugins.replace( '%appVersion.release%', release ) )
      .pipe( plugins.replace( '%appVersion.build%', build ) )
      .pipe( plugins.replace( '%appVersion.change%', change ) )
      // .pipe( plugins.bytediff.start() )
      // .pipe( plugins.uglify() )
      // .pipe( plugins.bytediff.stop() )
      .pipe( plugins.sourcemaps.write( './' ) )
      .pipe( gulp.dest( plugins.path.join( config.app.dest.folder, 'js' ) ) );
  });

  return gulp.task( 'scripts', ["scripts:vendor", "scripts:common", "scripts:components", "scripts:app"] );
}