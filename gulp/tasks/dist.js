var gulp = require('gulp');

gulp.task('dist', [
    'browserify',
    'sass',
    'icons',
    'templates',
    'vendors'
]);
