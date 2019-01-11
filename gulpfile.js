'use strict';

const
    pathNode = require('path'),
    // fs = require('fs'),
    gulp = require('gulp'),
    watch = require('gulp-watch'),
    // notify = require('gulp-notify'), // https://www.npmjs.com/package/gulp-notify
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    // rename = require('gulp-rename'),
    rigger = require('gulp-rigger'),
    plumber = require('gulp-plumber'),
    sourceMaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    cssMinify = require('gulp-minify-css'),
    imageMinify = require('gulp-imagemin'),
    gulpRimraf = require('gulp-rimraf'),
    pngQuant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload;

// APP PATHS
let path = {
    build: {
        html: pathNode.normalize('./build/'),
        js: pathNode.join(__dirname, 'build', 'js'),
        css: pathNode.join(__dirname, 'build', 'css'),
        img: pathNode.join(__dirname, 'build', 'images'),
        fonts: pathNode.join(__dirname, 'build', 'fonts'),
    },
    src: {
        html: './app/*.html',
        js: './app/js/index.js',
        style: './app/style/main.scss',
        img: './app/images/**/*.*',
        fonts: './app/fonts/**/*.*'
    },
    watch: {
        html: './app/**/*.html',
        js: './app/js/**/*.js',
        style: './app/style/**/*.scss',
        img: './app/images/**/*.*',
        fonts: './app/fonts/**/*.*'
    },
    clean: './build'
};

// SERVER CONFIG
let config = {
    server: {
        baseDir: pathNode.normalize('build')
    },
    tunnel: true,
    host: 'localhost',
    port: 9005,
    logPrefix: "Live Reload"
};

// HTML
gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

// JAVASCRIPT
gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(sourceMaps.init())
        .pipe(uglify())
        .pipe(sourceMaps.write()) // Write maps
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

// SCSS
gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(sourceMaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(cssMinify())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

// IMAGES
gulp.task('image:build', function () {
    // gulp.src(path.build.img, { read: false })
    //     .pipe(gulpRimraf());

    gulp.src(path.src.img)
        /*.pipe(imageMinify({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngQuant()],
            interlaced: true
        }))*/
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

// FONTS
gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

// COMBINE TASK
gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);

// CHANGE WATCHER
gulp.task('watch', function(cb) {
    watch([path.watch.html], {cwd: './'}, function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], {cwd: './', readDelay: 1000}, function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], {cwd: './'}, function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], {cwd: './', readDelay: 1000}, function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], {cwd: './'}, function(event, cb) {
        gulp.start('fonts:build');
    });
});

// WEB SERVER
gulp.task('server', function () {
    browserSync(config);
});

// CLEANER
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

// DEFAULT TASK
gulp.task('default', ['build', 'server', 'watch']);