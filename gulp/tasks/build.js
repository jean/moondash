var gulp = require('gulp');

gulp.task('build', [
    'browserify',
    'markup',
    'sass',
    'icons',
    'templates',
    'vendors',
    'test'
]);
