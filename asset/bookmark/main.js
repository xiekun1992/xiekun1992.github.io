tagModal.style.left = bookmarkModal.style.left = (document.body.clientWidth - bookmarkModal.clientWidth) / 2 + 'px';
function showBmAdd(){
	bookmarkModal.style.top = 0;
}
function showTagAdd(){
	tagModal.style.top = 0;
}
function hideAdd(element){
	element.style.top = -(10 + element.clientHeight) + 'px';
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
			tagName.value = tagIconUrl.value = '';
			hideAdd(tagModal);
		}
	});		
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
// ref.child("Jobs").set({
//     "full_name": "Steve Jobs",
//     "gender": "male"
// }, function(error) {
//     if (error == null){
//         // alert('数据同步到野狗云端成功完成');
//     }
// });
list();
function list(){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4){
			console.log(xhr.responseText);
			if(xhr.status == 200){
				var bms = JSON.parse(xhr.responseText), html = "";
				for(var b in bms){
					html += '<li>' +
						'<b class="title"><a href="' + bms[b].url + '" target="_blank">' + bms[b].title + '</a></b>' +
						'<div class="tag">' +
							'<div>nodejs</div>' +
							'<div>test</div>' +
						'</div>' +
						'<div class="timestamp">' +
							(bms[b].date && new Date(bms[b].date).format('yyyy-MM-dd HH:mm:ss')) +
						'</div>' +
					'</li>';
				}
				bookmarks.innerHTML = html;
			}
		}
	};
	xhr.open('GET', config.syncURL + '/bookmarks.json', true);
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