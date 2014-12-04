var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var config = require('../config').vendors;
var buildMode = require('../config').buildMode;
var dist = require('../config').dist;
var PACKAGE = require('../../package.json');

var src = [];
for(var key in PACKAGE.browser) {
    if(!buildMode.dist || dist.pruneVendors.indexOf(key) < 0) {
        src.push(PACKAGE.browser[key]);
    }
}

gulp.task('vendors', function() {
  gulp.src(src)
    .pipe(sourcemaps.init())
    .pipe(concat(config.outputName))
    .pipe(uglify())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(config.dest))
});