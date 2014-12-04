var gulp = require('gulp');
var buildMode = require('../config').buildMode;

if(buildMode.dist) {
    gulp.task('default', ['build']);
} else {
    gulp.task('default', ['watch']);
}