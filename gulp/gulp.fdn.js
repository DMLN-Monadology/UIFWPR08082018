/**
 * Created by hzou on 3/3/16.
 */


module.exports = {
  init: init
};

function init( gulp, plugins, config, _ ) {

  /**
   * @description handles i18n source files. This will merge all i18n files with the same name into 1 output file to be consumed by the application.
   *
   * This is the order of file overrides: App overrides Components which overrides Common => _.merge({}, common, components, app);
   */
  gulp.task( 'fdn', function( done ) {
    var jsonMerger     = require( './plugins/merge-json-merger' );
    var groupAggregate = require( 'gulp-group-aggregate' );

    var componentsFDN = _.get( config, "component.module.assets.FDN" );
    var appFDN        = _.get( config, "app.module.assets.FDN" );
    var customerFDN   = _.get( config, "app.customer.assets.FDN" );

    var sources = _.concat( componentsFDN, appFDN, customerFDN );

    return gulp.src( sources )
      .pipe( groupAggregate( {
        group    : ( file ) => file.path.replace( file.base, '' ),
        aggregate: ( group, files ) => {
          return {
            path    : group,
            contents: new Buffer( processFiles( group, files ) )
          };
        }
      } ) )
      // .pipe( plugins.filelog() )
      .pipe( gulp.dest( config.app.dest.fdn ) );

    function processFiles( group, files ) {
      var response = _.reduce( files, ( result, file ) => {

        var json = JSON.parse( _.get( file, "_contents", "{}" ) );
        switch ( json._UifwMergeAlgorithm ) {
          case "merge":
            delete result._UifwMergeAlgorithm;
            delete json._UifwMergeAlgorithm;
            jsonMerger.merge( result, json );
            break;
          default:
            result = json;
            break;
        }
        return result;
      }, {} );

      return JSON.stringify( response, null, '\t' );
    }

  } );
}
