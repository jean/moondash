var gulp = require('gulp');

gulp.task('test', [
  'unit',
  'midway',
  'e2e'
]);
