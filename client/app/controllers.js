angular.module('app.controller', [])
	.controller('appCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
		$rootScope.animation = "login";

	}])
	.controller('loginCtrl', ['$scope', '$rootScope', '$http', 'userInfo', '$timeout',
		function($scope, $rootScope, $http, userInfo, $timeout) {
			$scope.username;
			$scope.password;
			$scope.login = function() {
				$http.post('/user/login', {
						params: {
							username: $scope.username,
							password: hex_md5($scope.password)
						}
					})
					.success(function(data, status, headers, config) {
						if (200 == data.status) {
							userInfo.login = data.message;
							$scope.return();
							$scope.username = "";
							$scope.password = "";
							var start = 0;
							var end = -360;
							$rootScope.headInterval = setInterval(function() {
								if (end == start + 1) {
									angular.element('.head').css('-webkit-transform', 'rotateZ(-360deg)');
									return;
								}
								if (start > 90) angular.element('.login-gui li:last-child').css('display', 'none');
								var speed = Math.round((end - start) * 0.3);
								angular.element('.head').css('-webkit-transform', 'rotateZ(' + (start + speed) + 'deg)');
								start += speed;
							}, 100);
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
					if (start > 90) angular.element('.login-gui li:last-child').css('display', 'none');
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
			var start = 0;
			var end = 180;
			clearInterval($rootScope.returnInterval);
			angular.element('.login-gui li:last-child').css('display', 'inline-block');
			$rootScope.loginInterval = setInterval(function() {
				if (end == start + 1) {
					angular.element('.login-gui').css('-webkit-transform', 'rotateX(180deg)');
					return;
				}
				var speed = Math.round((end - start) * 0.3);
				angular.element('.login-gui').css('-webkit-transform', 'rotateX(' + (start + speed) + 'deg)');
				start += speed;
			}, 100);
		}
		$http.get('/search?keyword=' + $rootScope.$state.params.keyword + '&p=' + $rootScope.$state.params.p)
			.success(function(data) {
				$scope.searchResults = data;
			}).error(function() {});
		$rootScope.animation = "articles";
		$scope.key;
		$rootScope.$on('$stateChangeSuccess', function() {
			$http.get('/search?keyword=' + $rootScope.$state.params.keyword + '&p=' + $rootScope.$state.params.p)
				.success(function(data) {
					$scope.searchResults = data;
				}).error(function() {});
		});
		$scope.search = function(event) {
			if (event.keyCode == 13) {
				$http.get('/search?keyword=' + $scope.key + '&p=1')
					.success(function(data) {
						$scope.searchResults = data;
					}).error(function() {});
				$rootScope.$state.go('app.articles.search', {
					keyword: $scope.key,
					p: 1
				});
			}
		}

		$scope.articles;
		$scope.request = '/article_list?1=1';
		$scope.noResult;
		$rootScope.execSearch = false;
		//文章分类链接
		$scope.categoryLink = function(category) {
			$scope.request = '/article_list?category=' + category;
			$rootScope.execSearch = true;
			$rootScope.$state.go('app.articles.article_list');
		}
	}])
	//右侧文章列表
	.controller('articleListCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {}])
	//右侧文章详情
	.controller('articleDetailCtrl', ['$scope', '$rootScope', 'articleRest', function($scope, $rootScope, articleRest) {
		//restful请求单条文章数据
		articleRest.get({
			'id': $rootScope.$stateParams.id
		}, function(data) {
			$scope.article = data;
		});
	}])
	.controller('searchCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
		$scope.execSearch;
		$scope.searchResults;
	}])
	.controller('editCtrl', ['$scope', 'articleEditRest', function($scope, articleEditRest) {
		$scope.category = ['Angular', 'Node', 'MongoDB'];
		$scope.publish = function(content, title, category) {
			if (content && title) {
				articleEditRest.put({
					'title': title,
					'content': content,
					'category': category,
					'create_time': new Date()
				}, function(data) {
					console.log(data);
				});
			}
		}
	}]);