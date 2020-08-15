const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const server = require('./dist-server/app.js');

function buildTask() {
  return gulp.src('./src/**/*.ts')
    .pipe(tsProject())
    .pipe(gulp.dest('dist-server'));
}
Object.assign(buildTask, { displayName: 'build' });

gulp.task('watch', function() {
  gulp.watch(['./src/**/*.ts'], buildTask); 
});

gulp.task('start', gulp.series('watch', function() {
  server;
}));
