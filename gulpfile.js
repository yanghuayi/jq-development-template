var gulp = require('gulp'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    runSequence = require('run-sequence'),
    del = require('del'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');
var $ = gulpLoadPlugins();
var csso = require('gulp-csso');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var connect = require('gulp-connect');
var gulpCopy = require('gulp-file-copy');
var order = require('gulp-order');

function errrHandler( e ){
    // 控制台发声,错误时beep一下
    gutil.beep();
    gutil.log( e );
}

gulp.task('less',function(){
    return gulp.src('less/main.scss')
        .pipe(plumber())
        .pipe(less())
        .pipe(csso())
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true,
            remove: true
        }))
        .pipe(gulp.dest('dist/css'));
});


gulp.task('images', function() {
  return gulp.src('images/**/*')
    // .pipe($.cache($.imagemin({
    //   progressive: true,
    //   interlaced: true
    // })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'images'}));
});

gulp.task('clean', function() {
  return del(['dist/*', '!dist/.git'], {dot: true});
});

//使用connect启动一个Web服务器
gulp.task('connect', function () {
    connect.server({
        root: '',
        livereload: true,
        port: 3000
    });
});

gulp.task('copy', function () {
    gulp
        .src([])
        .pipe(gulp.dest('js'));
});
gulp.task('copyFonts', function () {
    gulp
        .src(['fonts/*'])
        .pipe(gulp.dest('dist/fonts'));
});
gulp.task('html', function () {
    gulp.src('*.html')
        .pipe(connect.reload());
});

gulp.task('minifyjs', function() {
    return gulp.src('js/*.js')
        .pipe(order([
          'jquery.1.11.1.min.js',
          '*.js'
        ]))
        .pipe(concat('main.js'))    //合并所有js到main.js
        .pipe(gulp.dest('dist/js'))    //输出main.js到文件夹
        .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(uglify().on('error', function (e) {
            console.log(e);
        }))    //压缩
        .pipe(gulp.dest('dist/js'));  //输出
});

// 构建任务
gulp.task('build', function(cb) {
  runSequence('clean', ['copy','copyFonts','less','images','minifyjs','connect','html'], cb);
});

gulp.task('watch',function(){
 	gulp.watch('less/**/*.scss',['less','html']);
   gulp.watch('images/**/*.{png,jpg,gif}',['images']);
   gulp.watch('js/*.js',['minifyjs']);
    gulp.watch(['*.html'], ['html']);
});

gulp.task('default',['build', 'watch']);
