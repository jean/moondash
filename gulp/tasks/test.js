var gulp = require('gulp');

gulp.task('test', [
  'build',
  'unit',
  'midway',
  'e2e'
]);
