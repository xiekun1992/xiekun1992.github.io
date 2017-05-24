export default class Menu {
	constructor(panel, option = []) {
		//type 可应用的元素, 0：全局, 1：图形, 2：画布, 3：连线
		//0：始终可用，1、2：activeShape为空时自动禁用
		this.options = [
			{text: '连线', cb: this.drawLine, type: 1},
			// {text: '复制', cb: this.copyShape, type: 1},
			// {text: '粘贴', cb: this.pasteShape, type: 2},
			// {text: '剪切', cb: this.cuteShape, type: 1}, 
			{text: '删除', cb: this.deleteShape, type: 1},
			{text: '删除', cb: this.deleteLine, type: 3},
			{text: '修改', cb: (panel, activeShape)=>{
				// 图形修改框
				let alterModalBg = document.querySelector("#xpanelMenuAlter");
				if(alterModalBg){
					alterModalBg.style.display="block";
				}else{
					alterModalBg = document.createElement('div');
					alterModalBg.classList.add('xpanel-saveimage-bg');
					alterModalBg.setAttribute('id','xpanelMenuAlter');
					document.body.appendChild(alterModalBg);
				}
				let externalDisplay='';
				if(activeShape.data.properties){
					let dataHTML='';
					for(let p in activeShape.data.properties){
						dataHTML+=`<div>${p}: ${activeShape.data.properties[p]}</div>`;
					}
					externalDisplay=`
						<hr/>
						<div>
							<span style="float:left;">外部数据</span>
							<span>${dataHTML}</span>
						</div>
					`;
				}
				alterModalBg.innerHTML=`
				<div class="xpanel-menu-alter">
					<h4>图形属性修改</h4>
					<div>
						<span>显示文本</span><div class="input" contenteditable="true" name="text">${activeShape.text}</div>
					</div>
					<div>
						<span>字体大小</span><input class="input" type="range" value="${activeShape.font.size}" onchange="this.nextSibling.innerHTML=this.value+'px'" name="font.size" min="14" max="20" step="1"><small style="vertical-align: super;">${activeShape.font.size}px</small>
					</div>
					<div>
						<span>背景颜色</span><input class="input" type="color" value="${activeShape.backgroundColor}" name="backgroundColor">
					</div>
					<div>
						<span>前景颜色</span><input class="input" type="color" value="${activeShape.color}" name="color">
					</div>
					${externalDisplay}
					<div>
						<button id="confirmAlter">确定</button>
						<button onclick="this.parentNode.parentNode.parentNode.style.display='none'">取消</button>
					</div>
				</div>
				`;

				document.querySelector("#confirmAlter").onclick=function (){
					var inputs = Array.from(document.querySelectorAll("#xpanelMenuAlter .input"));

					// activeShape.setText(inputs[0].innerHTML);
					panel.renameInput.style.fontSize = `${+inputs[1].value}px`;
					activeShape.setDimension({height: panel.renameInput.clientHeight});
					activeShape.setFont({size: +inputs[1].value});
					activeShape.setBackgroundColor(inputs[2].value);
					activeShape.setColor(inputs[3].value);
					panel.repaint();
					document.querySelector("#xpanelMenuAlter").style.display='none';
				}
				// console.log(activeShape)
			}, type: 1},
			{text: '保存为图片', cb: this.saveAsImage, type: 0},
			{text: '导出到草稿', cb: (panel)=>{
				localStorage.setItem("xpanel",JSON.stringify(panel.exportCanvasData()));
			}, type: 0},
			{text: '从草稿导入', cb: (panel)=>{
				let data = JSON.parse(localStorage.getItem("xpanel"));
				data && panel.importCanvasData(data);
			}, type: 0},
			{text: '全部清空', cb: panel=>{panel.reset();}, type: 0},
			...option
		];

		this.panel = panel;
		// 右键菜单
	  	this.element = document.createElement('div');
	  	this.element.oncontextmenu=function(){return false;};
	  	this.element.classList.add('xpanel-menu');
		let ul = document.createElement('ul'), frag = document.createDocumentFragment();
		for(let e of this.options){
			let li = document.createElement('li');
			li.innerHTML = e.text;
			li.addEventListener('click', this.actionWrapper.bind(this, e.type, e.cb));
			li.setAttribute('data-menutype', e.type);
			ul.appendChild(li);
		}
		frag.appendChild(ul);
		this.element.appendChild(frag);

		
	}
	disable(DOMElement, ...type) {
		if(type.indexOf(parseInt(DOMElement.getAttribute('data-menutype'))) !== -1){
			DOMElement.classList.add('disabled');
		}else{
			DOMElement.classList.remove('disabled');
		}
	}
	toggleGlobalOperation(e){
		if(e.getAttribute('data-menutype')==0){
			if(e.className.indexOf('disabled') == -1){
				e.classList.add('disabled');
			}else{
				e.classList.remove('disabled');
			}
		}
	}
	show({startX, startY}) {

		let onShape = this.panel.activedShape?true:false,
			onLine = this.panel.activedLine?true:false,
			hasShape = this.panel.hasShape();

		for(let e of Array.from(this.element.children[0].children)){
			if(onShape){
				this.disable(e, 2, 3);
			}else if(onLine){
				this.disable(e, 1, 2);
			}else{
				this.disable(e, 1, 2, 3);
			}
			// if(!hasShape){
			// 	this.toggleGlobalOperation(e);
			// }
		}
		let offsetLeft=startX-document.body.scrollLeft+2,
			offsetTop=startY-document.body.scrollTop+2,
			tmpHeight=this.element.clientHeight,
			tmpWidth=this.element.clientWidth;

			console.log(offsetTop,offsetLeft,typeof offsetTop)
		// 判断当前位置是否接触到边界
		if(tmpWidth+offsetLeft>=document.body.clientWidth){
			offsetLeft-=(tmpWidth + 4);
		}
		if(tmpHeight+offsetTop>=document.body.clientHeight){
			offsetTop-=(tmpHeight + 4);
		}
		this.element.style.top=offsetTop+'px';
		this.element.style.left=offsetLeft+'px';
		this.element.classList.add('show');
	}
	hide() {
		this.element.classList.remove('show');
	}
	destroy() {
		// 释放节点和引用，防止内存泄露
		this.element.parentNode.removeChild(this.element);
		this.element=null;
		this.panel=null;
	}
	actionWrapper(actionType, action) {
		if(this.panel.activedShape){
			if(actionType == 1 || actionType == 0){// 执行全局和图形操作的动作
				action.call(this, this.panel, this.panel.activedShape);
				this.hide();
			}
		}else if(this.panel.activedLine){
			if(actionType == 3){// 执行连线操作的动作
				action.call(this, this.panel, this.panel.activedLine);
				this.hide();
			}
		}else{
			if(actionType === 0){// 只执行全局操作的动作
				action.call(this, this.panel);
				this.hide();
			}
		}
	}
	drawLine(panel, activedShape) {
		panel.frontCanvas.style.cursor='crosshair';
		panel.drawLine = true;
		// 记录连线的起始图形
		panel.pathStart.shape = activedShape;
		// panel.repaint();
		activedShape.drawDots();
	}
	deleteLine(panel, activedLine) {
		activedLine && panel.deleteLine(activedLine, true);

	}
	deleteShape(panel, activedShape) {
		activedShape && panel.deleteShape(activedShape);
	}
	copyShape(panel, activedShape) {
		alert('copyShape');
	}
	cuteShape(panel, activedShape) {
		alert('cuteShape');
	}
	pasteShape(panel, activedShape) {
		alert('pasteShape');
	}
	alterShape(panel, activedShape) {

	}
	saveAsImage() {
		this.hide();
		let imageName = window.prompt('请输入图片名');
		if(imageName){
			let div = document.createElement('div'),
					mention = document.createElement('div'),
					imgdiv = document.createElement('div'),
					img = this.panel.saveAsImage(),
					a = document.createElement('a'),
					frag = document.createDocumentFragment();

			div.classList.add('xpanel-saveimage-bg');
			mention.classList.add('xpanel-saveimage-mention');
			mention.innerHTML = `在图片上 
								<span style="font-weight:bold;">鼠标右键另存为</span> 
								或者 
								<span style="font-weight:bold;">点击图片</span> 
								下载, 
								<a href="javascript:void(0)" onclick="document.body.removeChild(this.parentNode.parentNode)">取消</a>
								`;
			img.setAttribute('alt', imageName);
			img.setAttribute('title', imageName);
			a.setAttribute('title', imageName);
			a.appendChild(img);
			a.setAttribute('download', imageName);
			a.setAttribute('href', img.src);
			a.setAttribute('onclick',"document.body.removeChild(this.parentNode.parentNode)");

			imgdiv.appendChild(a);
			div.appendChild(mention);
			div.appendChild(imgdiv);
			frag.appendChild(div)
			document.body.appendChild(frag);
		}
	}
}