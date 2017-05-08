var resize = function(){
	tagModal.style.left = bookmarkModal.style.left = (document.body.clientWidth - bookmarkModal.clientWidth) / 2 + 'px';
};
resize();
window.onresize = resize;
function showModalBg(element){
	modalBg.classList.add('show');
	modalBg.onmousedown = function(){
		this.classList.remove('show');
		hideAdd(element);
	};
}
function showBmAdd(){
	title.focus();
	showModalBg(bookmarkModal);
	bookmarkModal.style.top = 0;
}
function showTagAdd(){
	tagName.focus();
	showModalBg(tagModal);
	tagModal.style.top = 0;
}
function hideAdd(element){
	element.style.top = -(10 + element.clientHeight) + 'px';
	modalBg.classList.remove('show');
}
function addBookmark(){
	var bookmark = {
		'title': title.value,
		'url': url.value,
		'tagId': bTags.value,
		'date': new Date().getTime()
	};
	if(isBookmarkUpdate){
		var obj = {};
		obj[isBookmarkUpdate] = bookmark;
		ref.child("bookmarks").update(obj, function(error){
			if(error){
				alert(error);
			}else{
				isBookmarkUpdate = false;
				title.value = url.value = '';
				hideAdd(bookmarkModal);
				list(tagList);
			}
		});
	}else{
		ref.child("bookmarks").push(bookmark, function(error){
			if(error){
				alert(error);
			}else{
				isBookmarkUpdate = false;
				title.value = url.value = '';
				hideAdd(bookmarkModal);
				list(tagList);
			}
		});		
	}
}
var isBookmarkUpdate = false;
function updateBookmark(bookmarkId){
	isBookmarkUpdate = bookmarkId;
	title.value = bookmarkList[bookmarkId].title;
	url.value = bookmarkList[bookmarkId].url;
	bTags.value = bookmarkList[bookmarkId].tagId;
	showBmAdd();
} 
function deleteBookmark(bookmarkId){
	ref.child("bookmarks").child(bookmarkId).remove();
	list(tagList);
}
function addTag(){
	var tag =  {
		'name': tagName.value,
		'icon': tagIconUrl.value,
		'date': new Date().getTime()
	};
	ref.child("tags").push(tag, function(error){
		if(error){
			alert(error);
		}else{
			listTags();
			tagName.value = tagIconUrl.value = '';
			hideAdd(tagModal);
		}
	});		
}
function showTags(e){
	if(!parseInt(right.style.left)){
		var lis = Array.prototype.slice.call(e.target.parentNode.parentNode.children);
		lis.forEach(function(o){
			o.classList.remove('active');
		});
		e.target.parentNode.classList.add('active');
		right.style.left = '300px';
	}else{
		e.target.parentNode.classList.remove('active');
		right.style.left = 0;
	}
}

var config = {
  syncURL: "https://xkfront-5220.wilddogio.com" //输入节点 URL
};
wilddog.initializeApp(config);
var ref = wilddog.sync().ref(), bookmarkList;

function list(tags){
	// return ;
	loading.style.display = 'block';
	get({
		url: config.syncURL + '/bookmarks.json',
		success:function(data, status){
			bookmarkList = data;
			loading.style.display = 'none';
			var html = "", index = 0;
			for(var b in data){
				var timer = setTimeout(function(b){
					var li      	   = document.createElement('li'),
						bTitle  	   = document.createElement('b'),
						bTitleA   	   = document.createElement('a'),
						divTag  	   = document.createElement('div'),
						div     	   = document.createElement('div'),
						divTimestamp   = document.createElement('div'),
						aDelete   	   = document.createElement('a'),
						aEdit     	   = document.createElement('a'),
						frag		   = document.createDocumentFragment();

					// html += '<li>' +
					// 	'<b class="title"><a href="' + data[b].url + '" target="_blank">' + data[b].title + '</a></b>' +
					// 	'<div class="tag">' +
					// 		'<div>' + (data[b].tagId && tags[data[b].tagId].name) + '</div>' +
					// 	'</div>' +
					// 	'<div class="timestamp">' +
					// 		(data[b].date && new Date(data[b].date).format('yyyy-MM-dd HH:mm:ss')) +
					// 	'</div>' +
					// 	'<a href="javascript:void(0)" title="双击以删除" ondblclick="deleteBookmark(\'' + b + '\')">删除</a>' +
					// 	'<a href="javascript:void(0)" onclick="updateBookmark(\'' + b + '\')">编辑</a>' +
					// '</li>';

					bTitleA.setAttribute('href', data[b].url);
					bTitleA.setAttribute('target', '_blank');
					bTitleA.innerHTML = data[b].title;
					bTitle.classList.add('title');
					bTitle.appendChild(bTitleA);

					divTag.classList.add('tag');
					div.innerHTML = (data[b].tagId && tags[data[b].tagId].name);
					divTag.appendChild(div);

					divTimestamp.classList.add('timestamp');
					divTimestamp.innerHTML = (data[b].date && new Date(data[b].date).format('yyyy-MM-dd HH:mm:ss'));

					aDelete.setAttribute('href', 'javascript:void(0)');
					aDelete.setAttribute('title', '双击以删除');
					aDelete.ondblclick = deleteBookmark.bind(null, b);
					aDelete.innerHTML = "删除";

					aEdit.setAttribute('href', 'javascript:void(0)');
					aEdit.onclick = updateBookmark.bind(null, b);
					aEdit.innerHTML = "编辑";

					li.appendChild(bTitle);
					li.appendChild(divTag);
					li.appendChild(divTimestamp);
					li.appendChild(aDelete);
					li.appendChild(aEdit);

					frag.appendChild(li);
					bookmarks.appendChild(frag);
					clearTimeout(timer);
				}.bind(null, b), index);
				index+=100;
			}
			// bookmarks.innerHTML = html;
		}
	});
}
var tagList = [];
function listTags(){
	get({
		url: config.syncURL + '/tags.json',
		success: function(data, status){
			tagList = data;
			list(data);
			var html = "", options = "";
			for(var b in data){
				html += '<li>' +
					'<a href="javascript:void(0)" target="_blank"><b>' + data[b].name + '</b></a>' +
				'</li>';
				options += '<option value="' + b + '">' + data[b].name + '</option>';
			}
			tags.innerHTML = html;
			bTags.innerHTML = options;
		}
	});
}
listTags();

function get(requestParams){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4){
			requestParams.success(JSON.parse(xhr.responseText), xhr.status);
		}
	};
	xhr.open('GET', requestParams.url, true);
	xhr.send();
}

(function(global){
	function Event(){
		this.events = {};
	}
	Event.prototype.on = function(eventName, cb){
		!this.events[eventName] && (this.events[eventName] = []);
		this.events[eventName].push(cb);
	};
	Event.prototype.emit = function(eventName, args){
		this.events[eventName].forEach(function(o, i){
			o(args);
		});
	};

	global.Event = new Event();
})(window);

Date.prototype.format = function(formatStr){
	function addPrefixZero(number){
		return ('0' + number).substr(-2);
	}
	return formatStr
		.replace(/yyyy/g, this.getFullYear())
		.replace(/MM/g, addPrefixZero(this.getMonth() + 1))
		.replace(/dd/g, addPrefixZero(this.getDate()))
		.replace(/HH/g, addPrefixZero(this.getHours()))
		.replace(/mm/g, addPrefixZero(this.getMinutes()))
		.replace(/ss/g, addPrefixZero(this.getSeconds()));
};