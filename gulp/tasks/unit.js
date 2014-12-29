var
  gulp = require('gulp'),
  mocha = require('gulp-mocha'),
  testConf = require('../config').unit;

gulp.task('unit', function () {
  return gulp.src(testConf.src)
    .pipe(mocha({reporter: 'dot'}));
});
