angular.module('app.controller', [])
	.controller('loginCtrl', ['$scope', '$rootScope', '$http',
		function($scope, $rootScope, $http) {
			$scope.username;
			$scope.password;
            $scope.key;
            $rootScope.animation = "articles";
            $scope.response=$scope.login=$scope.logout=false;
			$scope.signOut=function(){
				$http.get('/user/logout',{params:{id:$rootScope.user._id}})
                    .success(function(data,status,headers,config){
                        $scope.logout=data;
                        if(200==data.status){
                            $rootScope.$state.go('app.articles.article_list',{page:1});
                        }
                    }).error(function(){});
			}
			$scope.signIn = function() {
				$http.post('/user/login', {params: {username: $scope.username,password: hex_md5($scope.password)}})
					.success(function(data, status, headers, config) {
                        $scope.login=data;
                        if (200 == data.status) {
							$rootScope.user = data.message;
						}
					});
			}
			$scope.forgetPwd=function(){
				$http.get('/user/reset_password').success(function(data){
                    $scope.response=data;
				});
			}
		}
	])
    //密码重置
	.controller('passwordCtrl', ['$scope','$rootScope','$http','$timeout', function ($scope,$rootScope,$http,$timeout) {
		//密码
		$scope.p1
		$scope.p2
		//验证token的有效性
		$http.get('/user/password/token?key='+$rootScope.$state.params.token)
		.success(function(data){
			if(200!=data.status){
				$rootScope.$state.go('app.articles.article_list',{page:1});
			}
		}).error(function(){
			$rootScope.$state.go('app.articles.article_list',{page:1});
		});
		//重置为新密码
        var jumpCounter;
		$scope.reset=function(){
			$scope.alert=false;
			$scope.p1=hex_md5($scope.p1)
			$http.post('/user/password/new',{params:{p:$scope.p1,key:$rootScope.$state.params.token}})
			.success(function(data){
				if(200==data.status){
					$scope.p1=$scope.p2=null;
                    $scope.alertWarning=false;
                    $scope.alert=true;
                    $scope.counter=5;
                    jumpCounter=setInterval(function(){
                        $scope.$apply($scope.counter=$scope.counter-1);//更新页面上的值
                        if($scope.counter<=0) {
                            $rootScope.$state.go('app.articles.article_list',{page:1});
                            clearInterval(jumpCounter);
                        }
                    },1000);
                }else{
                    $scope.alert=false;
                    $scope.alertWarning=true;
                }
                $scope.msg=data.message;
			}).error(function(){});
		}
        $scope.jumpToIndex=function(){
            clearInterval(jumpCounter);
            $rootScope.$state.go('app.articles.article_list',{page:1});
        }
	}])
	//文章的总结构
	.controller('articlesCtrl', ['$scope', '$rootScope', '$http', '$location', '$timeout', function($scope, $rootScope, $http, $location, $timeout) {
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
			$rootScope.$state.go('app.articles.article_list',{page:1});
		}
	}])
	//右侧文章列表
	.controller('articleListCtrl', ['$scope', '$rootScope', '$http','articleRest','articleFavor',
        function($scope, $rootScope, $http,articleRest,articleFavor) {
		$scope.articles=[];
		$scope.request = '/article_list?';
        $scope.currentPage=parseInt($rootScope.$stateParams.page) || 1;
		$scope.noResult;
		$scope.execSearch = true;//启动分页搜索


        //喜欢文章
        $scope.favor=function(obj){
            articleFavor(obj._id).then(function(){
                obj.favor++;
            });
        }
        //修改文章
		$scope.edit=function(id){
			$rootScope.$state.go('app.articles.edit',{id:id,'page':$rootScope.$stateParams.page,position:0});
		}
        //删除文章
		$scope.delete=function(id){
			articleRest.remove({'id':id},function(data){
				if(200==data.status){
                    angular.forEach($scope.articles,function(a,key){
                        if(a._id==id){
                            $scope.articles.splice(key,1);
                            return;
                        }
                    });
				}
			});
		}
	}])
	//右侧文章详情页
	.controller('articleDetailCtrl', ['$scope', '$rootScope', 'articleRest','articleFavor',
        function($scope, $rootScope, articleRest, articleFavor) {
		//restful请求单条文章数据
		articleRest.get({
			'id': $rootScope.$stateParams.id,'flip':0,'position':$rootScope.$stateParams.position
		}, function(data) {
            $rootScope.$emit('turnPage',data);
			if(200==data.status)
				$scope.article = data.message;
		});
        //返回到文章列表页
        $scope.back=function(){
            $rootScope.$state.go('app.articles.article_list',{page:$rootScope.$stateParams.page});
        }
        //喜欢文章
        $scope.favor=function(obj){
            articleFavor(obj._id).then(function(){
                obj.favor++;
            });
        }
        //修改文章
        $scope.edit=function(id){
            $rootScope.$state.go('app.articles.edit',{id:id,'page':$rootScope.$stateParams.page,position:0});
        }
        //删除文章
        $scope.delete=function(id){
            articleRest.remove({'id':id},function(data){
                if(200==data.status){
                    angular.forEach($scope.articles,function(a,key){
                        if(a._id==id){
                            $scope.articles.splice(key,1);
                            return;
                        }
                    });
                    $rootScope.$state.go('app.articles.article_list',{page:$rootScope.$stateParams.page});
                }
            });
        }
	}])
    //搜索
	.controller('searchCtrl', ['$scope', '$rootScope','$http', function($scope, $rootScope,$http) {
		$scope.searchResults;
		$scope.request='/search?keyword=' + $rootScope.$state.params.keyword+ '&p=' + $rootScope.$state.params.p;
		$scope.execSearch=true;
	}])
    //编辑文章
	.controller('editCtrl', ['$scope', 'articleRest','$rootScope', 
		function($scope, articleRest,$rootScope) {
        $scope.welcome='写点东西吧';
        $scope.data={};
		$scope.category = ['Angular', 'Node', 'MongoDB'];
        $scope.result=false;//true:ajax请求响应成功
		//发布文章
		$scope.operate = function(op,content, title, category) {//op 1:发表，0:更新
			if(op){//新建文章
				if (content && title) {
					articleRest.save({
						'title': title,
						'content': content,
						'category': category,
						'create_time': new Date()
					}, function(data) {
						if(200==data.status){
							$scope.result=true;
                            $scope.data={};
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
						$rootScope.$state.go('app.articles.article_list',{page:1});
                        $scope.result=true;
                        $scope.data={};
					}
			    });
			}
			
		}
		//传入的id不为空则获取文章
		if($rootScope.$stateParams.id && $rootScope.$stateParams.id.length==24){
			$scope.op=0;
			articleRest.get({'id':$rootScope.$stateParams.id,'flip':0,position:$rootScope.$stateParams.position},function(data){
				if(200==data.status){
					$scope.data=data.message;
                    $scope.welcome='正在修改已有文章';
				}
			});
		}
        //返回到文章列表页
        $scope.back=function(){
            $rootScope.$state.go('app.articles.article_list',{page:$rootScope.$stateParams.page});
        }
	}]);