var gulp = require('gulp');
var buildMode = require('../config').buildMode;

if(buildMode.dist) {
    gulp.task('default', ['icons', 'dist']);
} else {
    gulp.task('default', ['icons', 'watch']);
}