var gulp = require('gulp');
var config = require('../config').icons;

gulp.task('icons', function () {
  return gulp.src(config.src, {base: config.base})
    .pipe(gulp.dest(config.dest));
});
