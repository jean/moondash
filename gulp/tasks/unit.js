var
  gulp = require('gulp'),
  mocha = require('gulp-mocha');

gulp.task('unit', function () {
  return gulp.src([
                    'src/**/test/unit/*.js'
                  ])
    .pipe(mocha({reporter: 'dot'}));
});
