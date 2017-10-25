/**
 * Created by hzou on 3/3/16.
 */

var fs     = require( 'fs' );
var moment = require( 'moment' );

module.exports = {
  init: init
};

function init( gulp, plugins, config, _, util ) {

  /*==========================================================
   =   Determine version info from the current environment   =
   ===========================================================*/

  var haveUifwNightlyVersion = isNightlyBuildWorkspace();

  var release, build, change;

  // Kit build, with version info in uifw-nightly-version.json
  if ( haveUifwNightlyVersion ) {
    gulp.task( 'getNightlyVersion', function( callback ) {
      return fs.readFile( 'uifw-nightly-version.json', 'utf8', function( err, data ) {
        if ( err ) {
          throw err;
        }
        if ( ( data === null ) || ( data === '') ) {
          throw "No UIFW Nightly Version Data";
        }
        var uifwVersionWrapper = JSON.parse( data );
        var uifwVersion        = _.get( uifwVersionWrapper, 'uifw-nightly-version' );
        if ( !uifwVersion || ( typeof uifwVersion != 'object' ) ) {
          throw 'Invalid UIFW Nightly Version';
        }
        release = uifwVersion.release;
        build   = uifwVersion.build;
        change  = uifwVersion.change;

        callback();
      } );
    } );
  }

  // Local build, or version info is otherwise not available
  else {
    gulp.task( 'getInternalVersion', function( callback ) {
      var now = moment();

      release = 'internal';
      build   = now.format( 'YYYY-MM-DD' );
      change  = now.format( 'hh:mm.ss a' );

      callback();
    } );
  }

  gulp.task( 'updateAppConfig', function() {
    // Sets the version info in the in-memory gulp config
    _.set( config.app, 'appVersion.release', release );
    _.set( config.app, 'appVersion.build', build );
    _.set( config.app, 'appVersion.change', change );
  } );


  // Sequence tasks
  gulp.task( 'version', function( done ) {
    if ( haveUifwNightlyVersion ) {
      return plugins.seq( 'getNightlyVersion', 'updateAppConfig', done );
    }
    else {
      return plugins.seq( 'getInternalVersion', 'updateAppConfig', done );
    }
  } );

  function isNightlyBuildWorkspace() {
    return ( process.env.UIFW_NIGHTLY === '1' ) && fs.existsSync( 'uifw-nightly-version.json' );
  }
}
