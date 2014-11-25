var gulp = require('gulp');
var config = require('../config').markup

gulp.task('markup', function () {
  return gulp.src(config.src, {base: config.base})
    .pipe(gulp.dest(config.dest));
});