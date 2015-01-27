var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    notify = require("gulp-notify"),
    config = require('../config').checker;

gulp.task('checker', function() {
    return gulp.src(config.src)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter(notify({
        title: 'JSHint',
        message: 'JSHint Passed.',
    })));
});
