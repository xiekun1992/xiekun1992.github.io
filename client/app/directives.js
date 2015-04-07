angular.module('app.directive', [])
	.directive('emoji', ['$timeout', function($timeout) {
		return {
			scope: {

			},
			transclude: true,
			templateUrl: 'tpls/partials/emoji.html',
			link: function(scope, element, attrs) {
				//示例生成emoji图片输入 
				scope.emojiData = [];
				scope.show = false;
				scope.changeShow = function() {
					element.find("ul.emoji-pak").css('opacity', 0).css('display', 'none');
					$timeout(function() {
						element.find("ul.emoji-pak").css('display', '').css('opacity', 1);
					}, 100);
				}
				var emos = getEmojiList()[0]; //此处按需是否生成所有emoji
				for (var j = 0; j < emos.length; j++) {
					var emo = emos[j];
					var data = 'data:image/png;base64,' + emo[2];
					scope.emojiData.push({
						'data': data,
						'emo': emo[1]
					});
				}

				function fillContent(obj) {
						var img = obj.src;
						var text = document.getElementById('text');
						console.log(obj.outerHTML)
						var tmp = decode(obj.outerHTML);
						text.innerHTML += parse(tmp);
						// text.focus();
					}
					//反解析（web上，图片数据转为emoji字符编码存储）
				function decode(htmlStr) {
						//todo 正则替换性能更优？unicode16='1f603'
						if (typeof ioNull == 'undefined') {
							return '';
						}
						var tempStr = htmlStr,
							unis = '',
							$imgs = $('<div>').append(htmlStr).find('img');
						$.each($imgs, function(i, o) {
							var $img = $(o);
							var unicode16 = '0x' + $img.attr('unicode16'); //十六进制
							unicode16 = ioNull.emoji.decodeChar(unicode16);
							// unis += unicode16;
							tempStr = tempStr.replace($('<div>').append($img).html(), unicode16);
						});
						// console.log(unis)
						return tempStr;
					}
					//解析存储的emoji表情
				function parse(arg) {
					if (typeof ioNull != 'undefined') {
						return ioNull.emoji.parse(arg);
					}
					return '';
				}
			}
		}
	}])
	.directive('alink', [function() {
		return {
			scope: {

			},
			transclude: true,
			templateUrl: 'tpls/partials/alink.html',
			link: function(scope, element, attrs) {
				scope.showInput = function(event) {
					element.find(event.currentTarget).siblings('div').toggleClass('show-input');
				}
			}
		}
	}])
	/**
	 * 分页器
	 * @param {scope} list ajax返回的当前页的数据
	 * @param {scope} request 每次请求的url(可能带有参数)
	 * @param {scope} no-result 当请求不到数据时,显示该变量的值("暂无数据")
	 * @param {scope} show-last boolean是否显示末页按钮
	 */
	.directive('page', function($http) {
		return {
			restrict: "AE",
			scope: {
				list: '=',
				request: '=',
				noResult: '=',
				execSearch: '='
			},
			templateUrl: "tpls/partials/pagination.html",
			link: function(scope, element, attrs) {
				//每次变化一级时发生改变,确定所在一级的起始页号,每5个按钮为一级,末页所在一级不论按钮个数
				scope.start = 1;
				//当前的页数
				scope.currentPage = 1;
				//分页长度,5个按钮与scope.pages对应
				scope.paginationLength = 5;
				scope.pages = [0, 1, 2, 3, 4];
				//最大页数初始化
				scope.maxPage = 1;
				/**
				 * 根据相应的url,ajax获取当前页的数据
				 */
				scope.search = function() {
					var url;
					if(scope.request.indexOf('&p=')>-1){
						url=scope.request;
					}else{
						url=scope.request + '&p=' + scope.currentPage;
					}
					$http.get(url, {})
						.success(function(data,status,headers,config) {
							scope.list = data;
							//返回的数据条数除以10上取整来确定最大页数
							scope.maxPage = Math.ceil(headers('count') / 10) || 1;
							scope.noResult = "";
							//回到页面最上方
							window.scrollTo(0, 0);
						})
						.error(function(data) {
							scope.list = [];
							scope.maxPage = 1;
							scope.noResult = "暂无数据";
						});
				}
				// scope.search();
				scope.$watch('execSearch',function(newValue,oldValue){
					if(newValue){
						scope.currentPage = 1;
						scope.start = 1;
						scope.search();
					}
					scope.execSearch=false;
					
				});
				/**
				 * 点击末页后,确定末页所在一级的起始页号
				 * 例如:
				 * 末页5、10、20、30,则当前所在一级的起始页号为1、6、16、26
				 * 末页4、8、16、22,则当前所在一级的起始页号为1、6、16、21
				 */
				function startPosition() {
					var c = scope.maxPage % scope.paginationLength;
					if (c >= 1 && c <= 4) {
						scope.start = scope.paginationLength * Math.floor(scope.maxPage / scope.paginationLength) + 1;
					} else {
						scope.start = scope.paginationLength * Math.floor((scope.maxPage - 1) / scope.paginationLength) + 1;
					}
				}

				/**
				 * 选页(直接到某一页、首页、末页),已经是当前页则不跳转,更新当前页后ajax请求数据
				 * @param number 要跳转的页号
				 */
				scope.selectPage = function(number) {
						if (scope.currentPage == number) return;
						scope.currentPage = number;
						//若为首页或末页则重新确定所在一级的起始页号
						if (1 == number) { //首页
							scope.start = 1;
						} else if (scope.maxPage == number) { //末页
							startPosition();
						}
						scope.search();
					}
					/**
					 * 上一页,当前页没有上页时不跳转,翻页够一级后确定所在一级的起始编号
					 * scope.start=1、6、11、16、21、26...
					 * @param number 要上翻的页号
					 */
				scope.previousPage = function(number) {
						if (scope.currentPage <= 1) return;
						scope.selectPage(number);
						if (number % scope.paginationLength == 0 && number > 0) {
							scope.start -= scope.paginationLength;
						}
					}
					/**
					 * 下一页,当前页已为最大页时不跳转,翻页够一级后确定所在一级的起始编号
					 * scope.start=1、6、11、16、21、26...
					 * @param number 要下翻的页号
					 */
				scope.nextPage = function(number) {
						if (scope.currentPage >= scope.maxPage) return;
						scope.selectPage(number);
						if (scope.maxPage != number && number % scope.paginationLength == 1 && number > 0) {
							scope.start += scope.paginationLength;
						}
					}
					/**
					 * 上一级,每次减少一个分页长度直到为1且确定当前级的最后一个按钮为当前页
					 */
				scope.previousStage = function() {
						if (1 < scope.start) {
							scope.start -= scope.paginationLength;
						} else {
							scope.start = 1;
						}
						scope.currentPage = scope.start + scope.paginationLength - 1;
						scope.search();
					}
					/**
					 * 下一级,每次增加一个分页长度且确定当前级的第一个按钮为当前页
					 */
				scope.nextStage = function() {
						scope.start += scope.paginationLength;
						scope.currentPage = scope.start;
						scope.search();
					}
					/**
					 * 隐藏或显示下一级按钮,当达到最大页所在一级时隐藏
					 * @returns {boolean} 隐藏为true,显示为false
					 */
				scope.nextStageHide = function() {
					if (scope.start + scope.paginationLength > scope.maxPage) {
						return true;
					} else {
						return false;
					}
				}
			}
		}

	})
	.directive('textEditor',[function(){
		return {
			restrict:'AE',
			scope:{
				op:'=',
				data:'=',
				operate:'&',
				category:'='
			},
			templateUrl:'tpls/partials/simditor.html',
			link:function(scope,element,attrs){
				scope.$watch('data',function(newValue,oldValue){
					element.find('.simditor-body')[0].innerHTML=newValue.content;
					// element.find('#editor').val(newValue.content)
				},true);
				// element.find('button.btn').on('click',function(){
					// console.log(1)
					// scope.$apply(function(){
						// console.log(2)
				scope.submit=function(){
					scope.operate({
							content:element.find('#editor').val(),
							title:scope.data.title,
							category:scope.data.category
						});
				}
						
					// });
				// });
				var editor=new Simditor({
					textarea:element.find('#editor'),
					toolbarFloat:true
				})
				window.scrollTo(0, 0);
			}
		}
	}]);