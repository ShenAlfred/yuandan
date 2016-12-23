var gulp = require('gulp');
var server = require('gulp-server-livereload');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');


gulp.task('sass', function() {
    return gulp.src('./sass/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./css'))
});

gulp.task('watchsass', function () {
    gulp.watch('./sass/*.scss', ['sass']);
});

gulp.task('webserver', ['sass','watchsass'], function() {
	gulp.src('')
		.pipe(server({
            host: '127.0.0.1',
			port: '9000',
			livereload: {
                enable: true,
                filter: function (filename, cb) {
                    cb(!/\.(sa|le)ss$|node_modules/.test(filename));
                }
            },
            open: true,
            defaultFile: 'index.html'
		}));
});

gulp.task("dabaoHtml", function() {
	gulp.src('./*.html')
        .pipe(gulp.dest('dist'));
});
gulp.task("dabaoCss", function() {
    gulp.src('css/**')
        .pipe(minifyCSS({keepBreaks:true}))
        .pipe(gulp.dest('dist/css'));
});
gulp.task("dabaoJs", function() {
    gulp.src('js/**')
        .pipe(gulp.dest('dist/js'));
});
gulp.task("dabaoImages", function() {
    gulp.src('images/**')
        .pipe(gulp.dest('dist/images'));
});

gulp.task('dabao', ['dabaoHtml', 'dabaoCss', 'dabaoJs', 'dabaoImages'], function() {
});