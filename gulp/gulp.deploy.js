/**
 * Created by hzou on 3/3/16.
 */


module.exports = {
  init: init
};

function init( gulp, plugins, config, _, util ) {
  return gulp.task('deploy', ['clean'], function () {
    return plugins.seq('version', ['fonts', 'images', 'fdn', 'scripts:deploy', 'templates', 'i18n', 'sass', 'favicon'], 'html');
  });
}