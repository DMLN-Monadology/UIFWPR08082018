'use strict';

var gulp = require('gulp');
var _    = require('lodash');

var plugins = {
  chmod        : require('gulp-chmod'),
  concat       : require('gulp-concat'),
  cssmin       : require('gulp-cssmin'),
  dateFormat   : require('dateformat'),
  del          : require('del'),
  es           : require('event-stream'),
  exec         : require('child_process').exec,
  execSync     : require('child_process').execSync,
  filelog      : require('gulp-filelog'),
  fs           : require('fs'),
  imagemin     : require('gulp-imagemin'),
  jscs         : require('gulp-jscs'),
  jshint       : require('gulp-jshint'),
  karma        : require('karma').server,
  mobilizer    : require('gulp-mobilizer'),
  ngAnnotate   : require('gulp-ng-annotate'),
  ngFilesort   : require('gulp-angular-filesort'),
  path         : require('path'),
  pngcrush     : require('imagemin-pngcrush'),
  rename       : require('gulp-rename'),
  replace      : require('gulp-replace'),
  sass         : require('gulp-sass'),
  seq          : require('run-sequence'),
  size         : require('gulp-size'),
  sourcemaps   : require('gulp-sourcemaps'),
  streamqueue  : require('streamqueue'),
  templateCache: require('gulp-angular-templatecache'),
  uglify       : require('gulp-uglify'),
  wiredep      : require('wiredep')
};

var configs = {
  common   : require('./gulp/common.json'),
  component: require('./gulp/components.json'),
  app      : require('./gulp/app.json')
};

var tasks = require('require-dir')('./gulp/');

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});

_.forEach(tasks, function (task, name) {
  if (typeof task.init === "function") {
    task.init(gulp, plugins, configs, _);
  }
});
