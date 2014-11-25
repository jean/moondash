var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var handleErrors = require('../util/handleErrors');
var config = require('../config').sass;

gulp.task('sass', function() {
    gulp.src(config.src)
        .pipe(sass({onError: handleErrors}))
        .pipe(concat(config.outputName))
        .pipe(gulp.dest(config.dest));
});