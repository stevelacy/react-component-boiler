'use strict';

var http = require('http');
var path = require('path');

var lr = require('gulp-livereload');
var nib = require('nib');
var gif = require('gulp-if');
var gulp = require('gulp');
var stylus = require('gulp-stylus');
var cached = require('gulp-cached');
var jshint = require('gulp-jshint');
var deploy = require('gulp-gh-pages');
var autoprefix = require('autoprefixer-stylus');
var sourcemaps = require('gulp-sourcemaps');

var merge = require('merge-stream');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var ecstatic = require('ecstatic');
var reactify = require('reactify');
var browserify = require('browserify');

var paths = {
  js: 'src/**/*.js',
  static: ['samples/sandbox/src/**/*', '!samples/sandbox/src/**/*.js']
};

var bundleCache = {};
var pkgCache = {};

var bundler = watchify(browserify('./src/index.js', {
  cache: bundleCache,
  packageCache: pkgCache,
  fullPaths: true,
  standalone: 'react-component-boiler',
  debug: true
}));

var sampleBundler = watchify(browserify('./samples/sandbox/src/index.js', {
  cache: bundleCache,
  packageCache: pkgCache,
  fullPaths: true,
  standalone: 'sample',
  debug: true
}));
sampleBundler.transform(reactify);

gulp.task('watch', function(){
  bundler.on('update', function(){
    gulp.start('js');
  });
  sampleBundler.on('update', function(){
    gulp.start('samples');
  });
  gulp.watch(paths.static, ['static']);
});

gulp.task('js', function(){
  var browserifyStream = bundler.bundle()
    // browserify -> gulp transfer
    .pipe(source('react-component-boiler.js'))
    .pipe(buffer())
    .pipe(cached('js'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));

  var lintStream = gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));

  return merge(browserifyStream, lintStream);
});

gulp.task('samples', function(){
  return sampleBundler.bundle()
    // browserify -> gulp transfer
    .pipe(source('sample.js'))
    .pipe(buffer())
    .pipe(cached('samples'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('samples/sandbox/dist'))
    .pipe(lr());
});

gulp.task('static', function(){
  return gulp.src(paths.static)
    .pipe(cached('static-samples'))
    .pipe(gif('*.styl', stylus({
      use: [
        nib(),
        autoprefix()
      ]
    })))
    .pipe(gulp.dest('samples/sandbox/dist'))
    .pipe(lr());
});

gulp.task('sample-server', function(cb){
  var port = parseInt(process.env.PORT) || 9090;
  var rootFolder = path.join(__dirname, './samples/sandbox/dist');
  var server = http.createServer(ecstatic({root: rootFolder}));
  server.listen(port, cb);
});

gulp.task('deploy', function(){
  return gulp.src('./samples/sandbox/dist/**/*')
    .pipe(deploy());
});

gulp.task('default', ['js', 'samples', 'static', 'sample-server', 'watch']);
