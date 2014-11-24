var gulp = require('gulp');
var concat = require('gulp-concat');

var config = require('../config').vendors

gulp.task('vendors', function() {
  gulp.src(config.src)
    .pipe(concat(config.outputName))
    .pipe(gulp.dest(config.dest))
});