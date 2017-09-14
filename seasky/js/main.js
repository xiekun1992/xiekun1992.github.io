(function(factory){
	if(!this._x){
		this._x = {};
	}
	this._x.Main = factory();
})(function(){
	function Main(config){
		// config: bgMusic, musicBtn, textBtn, annotationBtn

		deviceWidth = window.deviceWidth;
		var rem = 60;
		if(deviceWidth < 750){
			rem = deviceWidth / (750 / 100);
		}
		document.getElementsByTagName('html')[0].style.fontSize = rem + 'px';


		var btnContainer = document.createElement('ul');
		var desc = document.createElement('p');

		if(config.musicBtn){
			var closeMusicLi = document.createElement('li');
			var closeMusic = document.createElement('a');
			closeMusic.innerText = '关闭音乐';
			closeMusic.setAttribute('href', 'javascript:void(0)');
			closeMusic.setAttribute('class', 'active');

			closeMusicLi.setAttribute('class', 'active');
			closeMusicLi.appendChild(closeMusic);
			btnContainer.appendChild(closeMusicLi);
			var musicPlay = true;
			closeMusic.onclick = function(){
				if(this.audio.paused){
					closeMusicLi.setAttribute('class', 'active');
					musicPlay = true;
					this.audio.src = config.bgMusic;
					this.audio.play();
					closeMusic.innerText = '关闭音乐';	
				}else{
					closeMusicLi.removeAttribute('class', 'active');
					musicPlay = false;
					this.audio.pause();
					closeMusic.innerText = '开启音乐';
				}
			}.bind(this);

			window.onblur = function(){
				musicPlay = false;
				this.audio.pause();
			}
			window.onfocus = function(){
				musicPlay = true;
				this.audio.play();
			}
		}
		if(config.textBtn){
			var textBtnLi = document.createElement('li');
			var textBtn = document.createElement('a');
			textBtn.innerText = '显示文字';
			textBtn.setAttribute('href', 'javascript:void(0)');
			textBtnLi.appendChild(textBtn);
			btnContainer.appendChild(textBtnLi);
			var textShow = false;
			textBtn.onclick = function(){
				_x.event.trigger('desc.change');
				if(textShow){
					textBtnLi.removeAttribute('class', 'active');
					text.style.opacity = 0;
					textBtn.innerText = '显示文字';
				}else{
					textBtnLi.setAttribute('class', 'active');
					text.style.opacity = 1;
					textBtn.innerText = '隐藏文字';
				}
				textShow = !textShow;
			}.bind(this);
		}
		if(config.annotationBtn){
			var annotationBtnLi = document.createElement('li');
			var annotationBtn = document.createElement('a');
			annotationBtn.innerText = '显示标注';
			annotationBtn.setAttribute('href', 'javascript:void(0)');
			annotationBtnLi.appendChild(annotationBtn);
			btnContainer.appendChild(annotationBtnLi);
			var annotationShow = false;
			annotationBtn.onclick = function(){
				if(annotationShow){
					annotationBtnLi.removeAttribute('class', 'active');
					annotationBtn.innerText = '显示标注';
				}else{
					annotationBtnLi.setAttribute('class', 'active');
					annotationBtn.innerText = '隐藏标注';
				}
				annotationShow = !annotationShow;
				_x.event.trigger('annotation.change', annotationShow);
			}
		}

		btnContainer.setAttribute('class', 'model-btns clearfix');
		desc.setAttribute('class', 'desc side-btn');
		desc.setAttribute('id', 'text');

		document.body.appendChild(btnContainer);
		document.body.appendChild(desc);
		
		if(config.bgMusic){
			this.audio = new Audio();
			this.audio.src = config.bgMusic;
			this.audio.autoplay = true;
			this.audio.loop = true;
			this.audio.onload = function(){
				this.play();
			}
			_x.event.on('audio.stop', function(){
				this.audio.pause();
			}.bind(this));
			_x.event.on('audio.playifneed', function(){
				if(musicPlay){
					this.audio.play();
				}
			}.bind(this));
		}
	}

	return Main;
});