'use strict';

var gulp = require('gulp');

/* ---------------------------------------------------------
 * CONFIGURATION
 * Please adapt the following settings to your project.
 * */

// PhoneGap Build config
// documentation here: https://github.com/marcbuils/gulp-phonegap-build
var pgbConfig = {
  // your App ID on PhoneGap Build
  appId: '879592',

  user: {
    // set your PhoneGap Build (Adobe) credentials below
    email: '',
    password: ''
  },

  keys: {
    // the password to unlock your Apple Developer certificate
    ios: {password: ''}
  },

  download: {
    // name you want to give to the packaged app file when downloading it from PhoneGap Build
    ios: 'idevxxi.ipa'
  }
};

/* End of CONFIGURATION, please do not change anything below this line.
 * --------------------------------------------------------- */

var paths = {
  styles: 'app/styles/main.scss',
  scripts: [
    'app/scripts/App.js',
    'app/scripts/controllers/*.js',
    'app/scripts/models/*.js',
    'app/scripts/collections/*.js',
    'app/scripts/views/Base.js',
    'app/scripts/views/**/*.js'
  ],
  scriptlibs: 'app/scripts/libs/**/*.js',
  images: 'app/images/**/*',
  fonts: 'app/fonts/**/*',
  extras: [
    'app/*.*',
    'app/audio/**/*',
    'app/data/**/*',
    'app/templates/**/*',
    '!app/*.html'
  ],
  archive: [
//    'hooks/**/*',
//    'merges/**/*',
//    'platforms/**/*',
    'plugins/**/*',
    'www/**/*',
    'icon.png',
    'splash.png'
  ],
  watch: [
    'app/*.html',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*',
    'app/data/**/*',
    'app/templates/**/*'
  ]
};

// load plugins
var $ = require('gulp-load-plugins')();

// styles
// compile sass, autoprefix and save to .tmp
gulp.task('styles', function () {
  return gulp.src(paths.styles)
      .pipe($.rubySass({
          style: 'expanded',
          precision: 10
      }))
      .pipe($.autoprefixer('last 2 versions'))
      .pipe(gulp.dest('.tmp/styles'))
      .pipe($.size());
});

// scripts
// run jshint on js (except the libs)
gulp.task('scripts', function () {
  return gulp.src(paths.scripts)
      .pipe($.jshint())
      .pipe($.jshint.reporter(require('jshint-stylish')))
      .pipe($.concat('main.js'))
      .pipe(gulp.dest('.tmp/scripts'))
      .pipe($.size());
});

// scriptlibs
// take all the libs
// (take all the JS libs, concatenate them and copy them to www)
gulp.task('scriptlibs', function () {
  return gulp.src(paths.scriptlibs)
      .pipe($.concat('libs.js'))
//      .pipe($.stripDebug())
      .pipe(gulp.dest('.tmp/scripts'))
      .pipe($.size());
});

// html
// compile assets and generate HTML index
gulp.task('html', ['styles', 'scriptlibs', 'scripts'], function () {
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');

  return gulp.src('app/*.html')
      .pipe($.useref.assets({searchPath: '{.tmp,app}'})) // parse build blocks in HTML
      .pipe(jsFilter)               // only JS files
//        .pipe($.uglify())             // > uglify
        .pipe(jsFilter.restore())     // > cancel filter
      .pipe(cssFilter)              // only CSS files
//        .pipe($.csso())               // > minify
        .pipe(cssFilter.restore())    // > cancel filter
      .pipe($.useref.restore())
      .pipe($.useref())
      .pipe(gulp.dest('www'))       // copy all the files to www
      .pipe($.size());
});

// images
// copy images (optimization in disabled)
gulp.task('images', function () {
  return gulp.src(paths.images)
//        .pipe($.cache($.imagemin({
//            optimizationLevel: 3,
//            progressive: true,
//            interlaced: true
//        })))
      .pipe(gulp.dest('www/images'))
      .pipe($.size());
});

// fonts
// copy fonts
gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')().concat(paths.fonts))
      .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
      .pipe($.flatten())
      .pipe(gulp.dest('www/fonts'))
      .pipe($.size());
});

// extras
// copy other files
gulp.task('extras', function () {
  return gulp.src(paths.extras, { base: "app", dot: true })
      .pipe(gulp.dest('www'));
});

// clean
// empty .tmp and www folders
gulp.task('clean', function () {
  return gulp.src(['.tmp', 'www', 'app.zip'], { read: false }).pipe($.clean());
});

// build
// run all the tasks and generate a zip file
gulp.task('build', ['html', 'images', 'fonts', 'extras'], function () {
  return gulp.src(paths.archive, { base: "." })
      .pipe($.zip('app.zip', { compress: true }))
      .pipe(gulp.dest('.'));
});

// phonegap-build
// run all the tasks and sends the app to PhoneGap Build for packaging
gulp.task('phonegap-build', ['html', 'images', 'fonts', 'extras'], function () {
  return gulp.src(paths.archive, { base: "." })
      .pipe($.phonegapBuild(pgbConfig));
});

// default
// clean and build the app on PhoneGap Build
gulp.task('default', ['clean'], function () {
    gulp.start('phonegap-build');
});

gulp.task('connect', function () {
    var connect = require('connect');
    var app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(connect.static('app'))
        .use(connect.static('.tmp'))
        .use(connect.directory('app'));

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function () {
            console.log('Started connect web server on http://localhost:9000');
        });
});

gulp.task('serve', ['connect', 'styles', 'scriptlibs', 'scripts'], function () {
    require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src('app/styles/*.scss')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app/styles'));

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect', 'serve'], function () {
    var server = $.livereload();

    // watch for changes

    gulp.watch(paths.watch).on('change', function (file) {
        server.changed(file.path);
    });

    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scriptlibs', 'scripts']);
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);
});
