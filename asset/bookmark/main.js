tagModal.style.left = bookmarkModal.style.left = (document.body.clientWidth - bookmarkModal.clientWidth) / 2 + 'px';
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
		'date': new Date().getTime()
	};
	ref.child("bookmarks").push(bookmark, function(error){
		if(error){
			alert(error);
		}else{
			title.value = url.value = '';
			hideAdd(bookmarkModal);
			list();
		}
	});		
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
var ref = wilddog.sync().ref();


// ref.update({
//   "messageboard":{
//     "message1":{
//         "content" : "Wilddog, Cool!!!!!",
//         "presenter" : "Jack"
//     }
//   }
// });
function list(){
	loading.style.display = 'block';
	get({
		url: config.syncURL + '/bookmarks.json',
		success:function(data, status){
			loading.style.display = 'none';
			var html = "";
			for(var b in data){
				html += '<li>' +
					'<b class="title"><a href="' + data[b].url + '" target="_blank">' + data[b].title + '</a></b>' +
					'<div class="tag">' +
						'<div>nodejs</div>' +
						'<div>test</div>' +
					'</div>' +
					'<div class="timestamp">' +
						(data[b].date && new Date(data[b].date).format('yyyy-MM-dd HH:mm:ss')) +
					'</div>' +
				'</li>';
			}
			bookmarks.innerHTML = html;
		}
	});
}
list();
function listTags(){
	get({
		url: config.syncURL + '/tags.json',
		success: function(data, status){
			var html = "";
			for(var b in data){
				html += '<li>' +
					'<a href="javascript:void(0)" target="_blank"><b>' + data[b].name + '</b></a>' +
				'</li>';
			}
			tags.innerHTML = html;
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