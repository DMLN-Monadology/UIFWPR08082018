(function() {
  'use strict';

  var gulp        = require( 'gulp' );
  var util        = require( 'util' );
  var url         = require( 'url' );
  var browserSync = require( 'browser-sync' );
  var seq         = require( 'run-sequence' );
  var argv        = require( 'yargs' ).argv;
  var proxy       = require( 'http-proxy-middleware' );
  var _           = require( 'lodash' );

  var proxyConfig;
  try {
    proxyConfig = require( './proxy' );
  } catch ( ex ) {
    proxyConfig = [];
  }

  function browserSyncInit( baseDir, files, browser ) {
    browser = browser === undefined ? 'default' : browser;

    var routes = null;
    if ( baseDir === 'src' || (util.isArray( baseDir ) && baseDir.indexOf( 'src' ) !== -1) ) {
      routes = {
        '/bower_components': 'bower_components'
      };
    }

    var proxies = _.map( proxyConfig, function( proxyConfigItem ) {
      var proxyPath   = url.parse( proxyConfigItem.target ).path,
          proxyPathRE = new RegExp( '^' + proxyPath );

      return proxy( proxyConfigItem.pattern, {
        target      : proxyConfigItem.target,
        pathRewrite : proxyConfigItem.pathRewrite,
        changeOrigin: true,
        secure      : proxyConfigItem.secure,
        logLevel    : proxyConfigItem.logLevel,
        toProxy     : proxyConfigItem.toProxy,
        onProxyRes  : function onProxyRes( proxyRes, req, res ) {
          var setCookies = proxyRes.headers['set-cookie'];

          if ( setCookies && setCookies.map ) {
            proxyRes.headers['set-cookie'] = setCookies.map( function( headerCookie ) {
              //re-write cookie path to "/"
              return headerCookie.replace( /path=\/.+;/, 'path=/;' );
            } );
          }

          // When redirected with a 302, the location to redirect to is relative to the server host.
          // This is valid and works in a deployed app, but for local UIs, anything in the proxy's target
          // past the port (i.e., the path) needs to be removed from the beginning of the redirect location.
          if ( proxyRes.statusCode === 302 && proxyPath ) {
            proxyRes.headers['location'] = proxyRes.headers['location'].replace( proxyPathRE, '' );
          }
        },
        onError     : function errorHandler( err ) {
          console.log( err );
        }
      } );
    } );

    var config = {
      startPath: '',
      server   : {
        baseDir   : baseDir,
        middleware: proxies,
        routes    : routes
      },
      open     : true,
      browser  : browser
    };

    //usage `gulp server --port=2222`
    //usage `gulp serve --port=2222`
    if ( argv.port ) {
      config.port = argv.port;
    }

    browserSync.instance = browserSync.init(
      files,
      config );
  }

  gulp.task( 'server', ['watch'], function() {
    browserSyncInit(
      ['www'],
      ['www/assets/**/*',
        'www/css/*.css',
        'www/js/*.js',
        'www/index.html'] );
  } );


  gulp.task( 'serve:dist', ['build'], function() {
    browserSyncInit( 'www' );
  } );

  gulp.task( 'serve:e2e', function() {
    browserSyncInit( 'www', null, [] );
  } );

  gulp.task( 'serve:e2e-dist', ['watch'], function() {
    browserSyncInit( 'www', null, [] );
  } );

  /*======================================
   =                BUILD                =
   ======================================*/

  gulp.task( 'serve', function( done ) {
    return seq( 'build', 'server', done );
  } );


})();
