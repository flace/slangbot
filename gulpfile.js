'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');

gulp.task('lint', () => {
  return gulp.src(['**/*.js', '!node_modules/**'])
    .pipe(eslint({ useEslintrc: true }))
    .pipe(eslint.format());
});
