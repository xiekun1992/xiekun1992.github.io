(function(factory){
	if(!this._x){
		this._x = {};
	}
	this._x.Video = factory;
})(function(config){
	var li = document.createElement('li'),
		a = document.createElement('a'),
		video = document.createElement('video'),
		videoContainer = document.createElement('div'),
		videoClose = document.createElement('a');

	a.setAttribute('href', 'javascript:void(0)');
	videoClose.setAttribute('href', 'javascript:void(0)');
	a.innerText = config.name;
	video.src = config.src;
	video.controls = true;
	video.preload = 'auto';
	video.setAttribute('playsinline', 'true');
	video.setAttribute('webkit-playsinline', 'true');
	video.setAttribute('x5-playsinline', 'true');
	videoContainer.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #000; z-index: 999; display: none;';
	video.style.cssText = 'width: 100%; height: 100%;';
	videoClose.innerHTML = '&times;';
	videoClose.style.cssText = 'color: rgb(255, 255, 255); position: absolute; top: 0; left: 0; font-size: 0.8rem; line-height: 0.8;';
	a.onclick = function(){
		_x.event.trigger('audio.stop');
		video.src = config.src;
		video.play();
		videoContainer.style.display = 'block';
	}
	videoClose.onclick = function(){
		video.pause();
		videoContainer.style.display = 'none';
		_x.event.trigger('audio.playifneed');
	}
	li.appendChild(a);
	modelNav.appendChild(li);
	videoContainer.appendChild(video);
	videoContainer.appendChild(videoClose);
	document.body.appendChild(videoContainer);

	// modelNav.style.left = 'calc(50% - ' + (modelNav.clientWidth/2) + 'px)';
});