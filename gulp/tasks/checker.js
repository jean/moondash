var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    config = require('../config').checker;

gulp.task('checker', function() {
    return gulp.src(config.src)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
});
