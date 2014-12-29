'use strict';

var gulp = require('gulp');

var protractor = require('gulp-protractor').protractor;

var webdriverUpdate = require('gulp-protractor').webdriver_update;
var browserSync = require('browser-sync');
var testConfig = require('../config').e2e;

gulp.task('webdriver-update', webdriverUpdate);

gulp.task('e2e', ['webdriver-update', 'browserSync:e2e'], function () {

  return gulp.src(testConfig.specs)
    .pipe(protractor({
        configFile: __dirname + '/' + testConfig.protractor,
                     args: ['']
    }))
    .on('error', function(err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    })
    .on('end', function() {
      setTimeout(function() {
        browserSync.exit();
      }, 1000);
    });
});
