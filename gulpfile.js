'use strict';

const
    pathNode = require('path'),
    gulp = require('gulp'),
    watch = require('gulp-watch'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    rigger = require('gulp-rigger'),
    plumber = require('gulp-plumber'),
    uglify = require('gulp-uglify'),
    rimraf = require('rimraf'),
    cleanCSS = require('gulp-clean-css'),
    del = require('del'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload;

// APP PATHS
let path = {
    build: {
        html: pathNode.normalize('./build/'),
        js: pathNode.join(__dirname, 'build', 'js'),
        css: pathNode.join(__dirname, 'build', 'css'),
        fonts: pathNode.join(__dirname, 'build', 'fonts')
    },
    src: {
        html: './app/*.html',
        js: './app/js/index.js',
        style: './app/style/main.scss',
        fonts: './app/fonts/**/*.*'
    },
    watch: {
        html: './app/**/*.html',
        js: './app/js/**/*.js',
        style: './app/style/**/*.scss',
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

// JavaScript task
gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        // dev scripts
        .pipe(rename('bundle.js'))
        .pipe(gulp.dest(path.build.js))
        // prod scripts
        .pipe(uglify())
        .pipe(rename('bundle.min.js'))
        .pipe(gulp.dest(path.build.js));
});

// SCSS task
gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        // dev styles
        .pipe(rename('bundle.css'))
        .pipe(gulp.dest(path.build.css))
        // prod styles
        .pipe(cleanCSS({debug: true, level: {1: {specialComments: 0}}}, function (details) {
            console.log(details.name + ' : ' + details.stats.originalSize);
            console.log(details.name + ' : ' + details.stats.minifiedSize);
        }))
        .pipe(rename('bundle.min.css'))
        .pipe(gulp.dest(path.build.css));
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
    'fonts:build'
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