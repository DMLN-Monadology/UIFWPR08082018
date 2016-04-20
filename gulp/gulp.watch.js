module.exports = {
  init: init
};

var watch = require('gulp-watch');

function init(gulp, plugins, config, _) {

  var watchlist = {
      'src/common/assets/images/**/*'        : ['images'],
      'src/common/assets/sass/**/*'          : ['sass'],
      'src/common/assets/vendors/**/*'       : ['scripts'],
      'src/common/modules/**/*.js'           : ['test:common', 'jshint:common', 'scripts:common'],
      'src/common/modules/**/*.html'         : ['templates'],
      'test/unit/common/**/*.js'             : ['test:common'],
    
      'src/components/**/assets/images/**/*' : ['images'],
      'src/components/**/assets/sass/**/*'   : ['sass'],
      'src/components/**/assets/vendors/**/*': ['scripts'],
      'src/components/**/modules/**/*.js'    : ['test:components', 'jshint:components', 'scripts:components'],
      'src/components/**/modules/**/*.html'  : ['templates'],
      'test/unit/components/**/*.js'         : ['test:components'],
    
      'src/app/assets/i18n/**/*'             : ['i18n'],
      'src/app/assets/images/**/*'           : ['images'],
      'src/app/assets/sass/**/*'             : ['sass'],
      'src/app/assets/mockData/**/*'         : ['mocks', 'scripts'],
      'src/app/assets/vendors/**/*'          : ['scripts'],
      'src/app/modules/**/*.js'              : ['test:app', 'jshint:app', 'scripts:app'],
      'src/app/modules/**/*.html'            : ['templates'],
      'test/unit/app/**/*.js'                : ['test:app'],
      'src/index.html'                       : ['html'],
      'gulp/**'                              : ['build']
    };


  gulp.task('watch', function () {
    _.forEach(watchlist, watchItem);

    function watchItem(tasks, src) {
      return watch(src, function () {
        return gulp.start(tasks);
      });
    }
  });

}
