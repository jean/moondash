var gulp = require('gulp');
var concat = require('gulp-concat');
var config = require('../config').vendors
var PACKAGE = require('../../package.json');

var src = [];
for(var key in PACKAGE.browser) {
    src.push(PACKAGE.browser[key]);
}

gulp.task('vendors', function() {
  gulp.src(src)
    .pipe(concat(config.outputName))
    .pipe(gulp.dest(config.dest))
});