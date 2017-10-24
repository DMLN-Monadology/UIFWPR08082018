/**
 * Created by hzou on 3/3/16.
 */


module.exports = {
  init: init
};

function init( gulp, plugins, config, _, util ) {

  /*==========================================================
   =   Determine version info from the current environment   =
   ===========================================================*/

  var fs                     = require('fs');

  var today                  = new Date();
  var todayISO               = plugins.dateFormat(today, 'yyyy-mm-dd') + 'T00:00:00.000';
  var suffix                 = '';
  var outputDateFormat       = 'yyyy.mmdd';
  var syncEncoding           = { encoding: 'utf-8' };
  var uifwUpdated            = false;
  var haveUifwNightlyVersion = isNightlyBuildWorkspace();
  var releaseno              = 'internal';

  var appBuildno, appCodeno,
      coreBuildno, coreBuildCount, coreCodeno,
      coreSHA = '';


  if ( haveUifwNightlyVersion ) {
    gulp.task( 'getNightlyVersion', function (callback) {
      return fs.readFile( 'uifw-nightly-version.json', 'utf8', function( err, data) {
        if ( err ) {
          throw err;
        }
        if ( ( data === null ) || ( data === '') ) {
          throw "No UIFW Nightly Version Data";
        }
        var uifwVersionWrapper = JSON.parse( data );
        var uifwVersion = _.get( uifwVersionWrapper, 'uifw-nightly-version' );
        if ( !uifwVersion || ( typeof uifwVersion != 'object' ) ) {
          throw 'Invalid UIFW Nightly Version';
        }
        releaseno  = uifwVersion.release;
        appBuildno = uifwVersion.build;
        appCodeno  = uifwVersion.change;

        callback();
      });
    });
  }
  else {
    gulp.task('gitFetch', function (callback) {
      return plugins.exec('git fetch --multiple origin uifw',
        function (err, stdout) {
          // If gitFetch errors, either git is not installed, this is not a git repo, or the remotes do not exist
          // In any case, abort other components for this task and write out a version file with missing info
          if (err) {
            appBuildno = appCodeno = coreBuildno = coreCodeno = 'missing';
          }
          uifwUpdated = !err;
          callback();
        });
    });

    // Looks through local and remote:uifw history for the most recent shared commit
    gulp.task('gitCoreInfo', function (callback) {
      if (!uifwUpdated) {
        console.log('Warning: Unable to obtain version information from uifw remote')
      }
      else {
        // Get all merged commits for this repo and the current branch
        var commits = plugins.execSync('git log --merges --pretty="%H|%ci" ', syncEncoding);

        var lines = _.compact(commits.split('\n'));
        var done  = false;

        // Check each merged commit against uifw/master for a match
        _.forEach(lines, function (commitLine) {
          var commitInfo = _.compact(commitLine.split('|')),
              commitSHA  = commitInfo[0],
              commitDate = new Date(commitInfo[1]),
              sinceDate  = new Date(commitDate).toISOString();

          // Look at all merges from uifw/master since the local SHA we are checking against
          var cmd = 'git log uifw/master --merges --pretty="%H|%ci" --since=\'' + sinceDate + '\'';

          var uifw      = plugins.execSync(cmd, syncEncoding).trim();
          var uifwLines = _.compact(uifw.split('\n'));

          _.forEach(uifwLines, function (uifwLine) {
            var uifwInfo = _.compact(uifwLine.split('|')),
                uifwSHA  = uifwInfo[0],
                uifwDate = new Date(uifwInfo[1]);

            // If the commit SHA matches, this is the most recent commit that is shared between core and this app
            if (uifwSHA === commitSHA) {
              // Count up the number of builds from core on that date
              coreBuildno = plugins.dateFormat(uifwDate, outputDateFormat);
              coreSHA     = uifwSHA;
              coreCodeno  = coreSHA.substr(0, 6);

              // Get the build count for uifw/master on the date of the commit
              var sinceDate = plugins.dateFormat(uifwDate.toISOString(), 'yyyy-mm-dd') + 'T00:00:00.000',
                  untilDate = new Date(uifwDate).toISOString();

              var countCmd = 'git rev-list uifw/master --count --merges '
                + ' --since=\'' + sinceDate + '\''
                + ' --until=\'' + untilDate + '\'';

              coreBuildCount = plugins.execSync(countCmd, syncEncoding).trim();

              done = true;
              return false; // break _.forEach
            }
          });

          // Short-circuit for outer _.forEach
          if (done) {
            return false;
          }
        });

        if (!coreCodeno) {
          console.log('Warning: No commits matching remote "uifw/master" were found');
          coreBuildno = coreCodeno = 'unavailable';
        }
        else {
          coreBuildno += ('.' + coreBuildCount);
        }
      }

      callback();
    });

    gulp.task('gitLocalInfo', function (callback) {
      if (uifwUpdated) {
        var branchName = '';

        // Get branch name
        var branchList = plugins.execSync( 'git branch --list', syncEncoding );
        var lines      = branchList.split( '\n' );
        _.forEach( lines, function( line ) {
          if ( line.match( /^\*/ ) ) {
            var split  = _.compact( line.split( /[ \t]/g ) );
            branchName = split[_.indexOf( split, "*" ) + 1];

            if ( branchName != 'master' ) {
              suffix = '|' + branchName.substr( 0, 10 );
            }
          }
        } );

        // Get latest commit for this branch
        var sha   = plugins.execSync( 'git log -n 1 --pretty=format:"%H" --branches=' + branchName + "*", syncEncoding );
        appCodeno = sha.substr( 0, 6 );

        // Get commit count for the current branch for today
        var commitCount = plugins.execSync(
          'git rev-list HEAD --count --since=\'' + todayISO + '\'' + ' --branches=' + branchName + "*",
          syncEncoding
        );

        var count  = parseInt( commitCount ) + 1;
        appBuildno = plugins.dateFormat( today, outputDateFormat ) + "." + count;
      }

      callback();
      return;
    } );
  }

  // Merge the results into the version.json template
  gulp.task('setVersion', function () {
    return gulp.src('version.json')
      .pipe(plugins.replace('{{releaseno}}', releaseno))
      .pipe(plugins.replace('{{appBuildno}}', appBuildno + suffix))
      .pipe(plugins.replace('{{appCodeno}}', appCodeno + suffix))
      .pipe(plugins.replace('{{coreBuildno}}', coreBuildno))
      .pipe(plugins.replace('{{coreCodeno}}', coreCodeno))
      .pipe(gulp.dest(config.app.dest.folder));
  });

  // Sequence tasks
  gulp.task('version', function (done) {
    if ( haveUifwNightlyVersion ) {
      return plugins.seq( 'getNightlyVersion', 'setVersion', done );
    }
    else {
      return plugins.seq('gitFetch', 'gitCoreInfo', 'gitLocalInfo', 'setVersion', done);
    }
  });

  function isNightlyBuildWorkspace() {
    return ( process.env.UIFW_NIGHTLY === '1' ) && fs.existsSync( 'uifw-nightly-version.json' );
  }
}
