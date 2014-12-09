'use strict';

var gulp = require('gulp');

var protractor = require('gulp-protractor').protractor;

var webdriverUpdate = require('gulp-protractor').webdriver_update;
var browserSync = require('browser-sync');
var config = require('../config');

gulp.task('webdriver-update', webdriverUpdate);

gulp.task('e2e', ['webdriver-update', 'browserSync:e2e'], function() {

  return gulp.src(config.e2e.specs)
    .pipe(protractor({
        configFile: __dirname + '/' + config.e2e.protractor,
    }))
    .on('error', function(err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    });
//    .on('end', function () {
//      browserSync.exit();
//      done();
//    });

});
