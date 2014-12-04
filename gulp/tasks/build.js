var gulp = require('gulp');

gulp.task('build', [
    'browserify',
    'markup',
    'sass',
    'partials',
    'vendors',
    'test'
]);
