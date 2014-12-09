var browserSync = require('browser-sync');
var gulp        = require('gulp');
var config      = require('../config').browserSync;

gulp.task('browserSync', ['build'], function() {
  browserSync(config.dist);
});

gulp.task('browserSync:e2e', ['build'], function() {
  browserSync(config.e2e);
});
