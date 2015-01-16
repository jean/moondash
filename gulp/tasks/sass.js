var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var minify = require('gulp-minify-css');
var handleErrors = require('../util/handleErrors');
var config = require('../config').sass;

gulp.task('sass', function() {
    gulp.src(config.src)
        .pipe(sourcemaps.init())
        .pipe(sass()
            .on('error', handleErrors)
        )
        .pipe(concat(config.outputName))
        .pipe(minify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(config.dest));
});
