angular.module('app.controller', [])
	.controller('appCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
		$rootScope.animation = "login";

	}])
	.controller('loginCtrl', ['$scope', '$rootScope', '$http', '$timeout',
		function($scope, $rootScope, $http,$timeout) {
			$scope.username;
			$scope.password;
			if($rootScope.user){
				angular.element('.head').css('left','358px').css('width','290px');
				angular.element('.head-circle').css('display','inline-block');
				angular.element('.head-panel').css('display','inline-block');
			}
			$scope.logout=function(){
				$http.get('/user/logout',{params:{id:$rootScope.user._id}})
				.success(function(data,status,headers,config){
					if(200==data.status){
						clearInterval($rootScope.head1Interval);
						$rootScope.$state.go('app.articles.article_list');
						$timeout(function(){
							var leftPosition=358;//358px 
							var rightPosition=290;//290px
							angular.element('.head-panel').css('display','none');
							angular.element('.head-circle').css('display','block');
							$rootScope.user=null;
							$rootScope.head2Interval = setInterval(function() {
								if(leftPosition<460){
									leftPosition+=3;
								}else{
									leftPosition=460;
								}
								if(rightPosition>80){
									rightPosition-=6;
								}else{
									rightPosition=80;
									return ;
								}
								console.log(rightPosition);
								console.log(leftPosition);
								angular.element('.head').css('left',leftPosition+'px').css('width',rightPosition+'px');
							}, 20);
						},1000);
					}
				}).error(function(){});
			}
			$scope.login = function() {
				$http.post('/user/login', {
						params: {
							username: $scope.username,
							password: hex_md5($scope.password)
						}
					})
					.success(function(data, status, headers, config) {
						if (200 == data.status) {
							$rootScope.user = data.message;
							$rootScope.user.last_login_time=new Date($rootScope.user.last_login_time).toLocaleDateString();
							$scope.return();
							$scope.username = "";
							$scope.password = "";
							$rootScope.$state.go('app.articles.article_list');
							clearInterval($rootScope.head2Interval);
							$timeout(function(){
								var leftPosition=460;
								var rightPosition=80;
								$rootScope.head1Interval = setInterval(function() {
									if(leftPosition>=360){
										leftPosition-=3;
									}
									if(rightPosition<=285){
										rightPosition+=6;
									}else{
										angular.element('.head-circle').css('display','inline-block');
										angular.element('.head-panel').css('display','inline-block');
										return;
									}
									angular.element('.head').css('left',leftPosition+'px').css('width',rightPosition+'px');
								}, 20);
							},1000);
						} else {
							$scope.loginError = data.message;
							$timeout(function() {
								$scope.loginError = "";
							}, 1000);
						}
					});
			}
			$scope.return = function() {
				clearInterval($rootScope.loginInterval);
				var start = 180;
				var end = 360;
				$rootScope.returnInterval = setInterval(function() {
					if (end == start + 1) {
						angular.element('.login-gui').css('-webkit-transform', 'rotateX(360deg)');
						return;
					}
					if (start > 270){
						angular.element('.login-gui li:first-child div').css('display', 'inline-block');
						angular.element('.login-gui li:last-child').css('display', 'none');
					}
					var speed = Math.round((end - start) * 0.3);
					angular.element('.login-gui').css('-webkit-transform', 'rotateX(' + (start + speed) + 'deg)');
					start += speed;
				}, 100);
			}
		}
	])
	//文章的总结构
	.controller('articlesCtrl', ['$scope', '$rootScope', '$http', '$location', '$timeout', function($scope, $rootScope, $http, $location, $timeout) {
		$scope.transform = function() {
			if($rootScope.user)
				return ;
			var start = 0;
			var end = 180;
			clearInterval($rootScope.returnInterval);
			$rootScope.loginInterval = setInterval(function() {
				if (end == start + 1) {
					angular.element('.login-gui').css('-webkit-transform', 'rotateX(180deg)');
					return;
				}
				if(start>10){
					angular.element('.login-gui li:first-child div').css('display', 'none');
					angular.element('.login-gui li:last-child').css('display', 'inline-block');
				}
				var speed = Math.round((end - start) * 0.3);
				angular.element('.login-gui').css('-webkit-transform', 'rotateX(' + (start + speed) + 'deg)');
				start += speed;
			}, 100);
		}

		$rootScope.animation = "articles";
		$scope.key;
		$scope.pwd="password";
		$scope.eyeIcon="glyphicon-eye-open";
		$scope.mention="显示密码";
		$scope.eye=function(){
			if($scope.pwd=="password"){
				$scope.pwd="text"
				$scope.eyeIcon="glyphicon-eye-close";
				$scope.mention="隐藏密码";
			}else{
				$scope.pwd="password"
				$scope.eyeIcon="glyphicon-eye-open";
				$scope.mention="显示密码";
			}
		}
		$scope.forgetPwd=function(){
			$http.get('/user/reset_password');
		}
		
		$scope.search = function(event) {
			if (event.keyCode == 13) {
				$rootScope.$state.go('app.articles.search', {
					keyword: $scope.key,
					p: 1
				});
			}
		}

		//文章分类链接
		$scope.categoryLink = function(category) {
			$scope.request = '/article_list?category=' + category;
			$rootScope.execSearch = true;
			$rootScope.$state.go('app.articles.article_list');
		}
	}])
	//右侧文章列表
	.controller('articleListCtrl', ['$scope', '$rootScope', '$http','articleRest', function($scope, $rootScope, $http,articleRest) {
		$scope.articles;
		$scope.request = '/article_list?';
		$scope.noResult;
		$scope.execSearch = true;
		$scope.edit=function(id){
			$rootScope.$state.go('app.articles.edit',{id:id});
		}
		$scope.delete=function(id){
			console.log(id);
			articleRest.remove({'id':id},function(data){
				if(200==data.status){

				}
			});
		}
	}])
	//右侧文章详情
	.controller('articleDetailCtrl', ['$scope', '$rootScope', 'articleRest', function($scope, $rootScope, articleRest) {
		//restful请求单条文章数据
		articleRest.get({
			'id': $rootScope.$stateParams.id
		}, function(data) {
			if(200==data.status)
				$scope.article = data.message;
		});
	}])
	.controller('searchCtrl', ['$scope', '$rootScope','$http', function($scope, $rootScope,$http) {
		$scope.searchResults;
		$scope.request='/search?keyword=' + $rootScope.$state.params.keyword+ '&p=' + $rootScope.$state.params.p;
		$scope.execSearch=true;
		// $rootScope.$on('$stateChangeSuccess', function() {
		// 	$http.get('/search?keyword=' + $rootScope.$state.params.keyword + '&p=' + $rootScope.$state.params.p)
		// 		.success(function(data) {
		// 			$scope.searchResults = data;
		// 		}).error(function() {});
		// });
	}])
	.controller('editCtrl', ['$scope', 'articleRest','$rootScope', 
		function($scope, articleRest,$rootScope) {
		$scope.op=1;//1:发表，0:更新
		$scope.data={title:'',category:'',content:''};
		$scope.category = ['Angular', 'Node', 'MongoDB'];
		//发布文章
		$scope.operate = function(content, title, category) {
			if($scope.op){//新建文章
				if (content && title) {
					articleRest.save({
						'title': title,
						'content': content,
						'category': category,
						'create_time': new Date()
					}, function(data) {
						console.log(data);
						if(200==data.status){
							$scope.data={title:'',category:'',content:''};
							window.scrollTo(0,0);
						}
					});
				}
			}else{//修改文章
				articleRest.post({
					'id':$rootScope.$stateParams.id,
					'title': title,
					'content': content,
					'category': category
				},function(data){
					if(200==data.status){
						$rootScope.$state.go('app.articles.article_list');
						$scope.data={title:'',category:'',content:''};
					}
			});
			}
			
		}
		//传入的id不为空则获取文章
		if($rootScope.$stateParams.id){
			$scope.op=0;
			articleRest.get({'id':$rootScope.$stateParams.id},function(data){
				if(200==data.status){
					$scope.data=data.message;
				}
			});
		}
	}]);