/**
 * Created by hzou on 3/3/16.
 */


module.exports = {
  init: init
};

function init( gulp, plugins, config, _, util ) {
  gulp.task('build', ['clean', 'jshint'], function (done) {
    var tasks = ['fonts', 'images', 'fdn', 'templates', 'scripts', 'mocks', 'sass', 'favicon', 'i18n'];
    return plugins.seq('version', tasks, 'html', 'test', done);
  });
}