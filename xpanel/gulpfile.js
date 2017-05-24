const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');

const clean = require('gulp-clean');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const webpackDevServer = require('webpack-dev-server');

gulp.task('clean', ()=>{
	gulp.src('./dist/**/*.js', {read: false})
		.pipe(clean());
});

gulp.task('webpack', ()=>{
	webpack(webpackConfig, (err, stats)=>{
		if(err){
			throw err;
		}
		console.log('webpack complete.');
	});
});
// 为webpack提供了一个静态文件服务器
gulp.task('server', ['webpack'], ()=>{
	new webpackDevServer(webpack(webpackConfig), {
		publicPath: '/' + webpackConfig.output.publicPath,
		stats: {
			colors: true
		},
		hot: true
	}).listen(9014, 'localhost', (err)=>{
		if(err){
			throw err;
		}else{
			console.log('[webpack-dev-server]', 'http://localhost:9014/webpack-dev-server/index.html');
		}
	});
})
gulp.task('dev', ['clean','webpack'], ()=>{
	gulp.watch('./src/**/*.js', ['clean','webpack']);
});

gulp.task('default', ['clean','webpack','server','dev']);