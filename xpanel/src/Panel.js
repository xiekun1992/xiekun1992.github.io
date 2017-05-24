import {Rectangle, Line} from './Shape';
import Menu from './Menu';
import Event from './Event';

// 产生每个图形的id
let incrementalId=1;

export default class Panel {
	constructor({container, width = 400, height = 400, menuOption = [], shapeOption = {}}) {
		if(typeof container !== 'string' && container.charAt(0) !== '#'){
			throw new Error(`Panel constructor require an id like #panel to be initialized.`);
		}
		this.container = document.querySelector(container);
		this.containerParent = this.container.parentNode;
		if(!this.container){
			throw new Error(`invalid parameter ${container}.`);	
		}
		this.container.innerHTML="";
		this.frontCanvas = document.createElement('canvas');
	  	this.bgCanvas = document.createElement('canvas');
		this.menu = new Menu(this, menuOption);
		this.shapeOption = shapeOption;

		const regx = /^(\d+)\%$/;
		let widthRes = regx.exec(width),
			heightRes = regx.exec(height);
			// this.width=width;
			// this.height=height;
		this.resizeFn=()=>{
			console.log(width)
			let widthRes = regx.exec(width),
				heightRes = regx.exec(height);
			if(widthRes){
				this.width = widthRes.pop()/100*this.containerParent.offsetWidth;
			}else{
				this.width = parseInt(width);
			}
			if(heightRes){
				this.height = heightRes.pop()/100*this.containerParent.offsetHeight;
			}else{
				this.height = parseInt(height);
			}

			this.bgCanvas.width = this.frontCanvas.width = this.width;
			this.bgCanvas.height = this.frontCanvas.height = this.height;
			this.initBackground();
			this.offset = this.countOffset(this.frontCanvas);
			this.repaint();
		}
		if(widthRes){
			this.width = widthRes.pop()/100*this.containerParent.offsetWidth;
			window.addEventListener('resize', this.resizeFn);
		}else{
			this.width = parseInt(width);
		}
		if(heightRes){
			this.height = heightRes.pop()/100*this.containerParent.offsetHeight;
		}else{
			this.height = parseInt(height);
		}

		this.bgCanvas.width = this.frontCanvas.width = this.width;
		this.bgCanvas.height = this.frontCanvas.height = this.height;
		this.container.classList.add('xpanel');
		this.frontCanvas.classList.add('xpanel-front');
		this.bgCanvas.classList.add('xpanel-background');

		// 重命名输入框
		this.renamingShape; // 处于重命名的图形
		let renameKeyboardInputTimer;
		this.renameInput = document.createElement('div');
		this.renameInput.classList.add('xpanel-rename-input');
		this.renameInput.setAttribute('contenteditable', 'true');
		this.renameInput.setAttribute('spellcheck', 'false');

		let changeText = (text)=>{
			if(this.renamingShape){
				let elementHeight = this.renameInput.clientHeight;
				this.renamingShape.setText(text);
				if(elementHeight < this.renamingShape.initial.height){
					// 小于默认高度则重置到默认值
					this.renamingShape.resetDimension();
					this.renamingShape.setDimension();
				}else{
					this.renamingShape.setDimension({height: elementHeight});
				}
				// this.renamingShape.isShow = true;
				this.repaint();
			}
		};
		this.renameInput.onmouseup = this.renameInput.onkeyup = this.renameInput.onkeydown = ()=>{
			// this.renamingShape.isShow = false;
			// this.repaint();
			renameKeyboardInputTimer = setTimeout(changeText.bind(this, this.renameInput.innerHTML), 0);
		};
		this.renameInput.onpaste = (e)=>{
			clearTimeout(renameKeyboardInputTimer);
			setTimeout(()=>{
				e.target.innerHTML = e.target.textContent;
				changeText(this.renameInput.innerHTML);
				this.setCursorAtEnd(this.renameInput);
			}, 0);
		}
		this.renameInput.onblur = ()=>{
			clearTimeout(renameKeyboardInputTimer);
			this.renameInput.style.zIndex = -1;
			this.renameInput.style.visibility = 'hidden';
			this.renamingShape.isShow = true;
			this.repaint();
			this.renamingShape = null;
		};
		this.container.appendChild(this.renameInput);

		this.shapes = [];
		this.paths = [];
		// 连线选中的图形上的点
		this.dotInfo = null;
		this.activedShape = null;
		this.activedLine = null;
		// 是否处于连线状态
		this.drawLine = false;
		// 是否处于局部/整体拖动状态
		this.move = false;
		// 新建路径的起点图形
		this.pathStart = {shape: null, direction: null};
		this.shapeRule = {};
		
		// 添加到dom
		this.container.appendChild(this.frontCanvas);
		this.container.appendChild(this.bgCanvas);
		this.container.appendChild(this.menu.element);
		// 存储画布的offset用于确定图形在画布中的相对位置
		this.offset = {left: 0,top: 0};

		this.frontCtx = this.frontCanvas.getContext('2d');
		this.bgCtx = this.bgCanvas.getContext('2d');

		this.offset = this.countOffset(this.frontCanvas);
		// console.log(this.offset);
		this.initEvents();
		this.initBackground();
		this.shapeRule['Rectangle'] = Rectangle;
		this.shapeRule['Line'] = Line;

		this.event = new Event();
	}
	// 查找激活的连线
	findActiveLine(mouseX, mouseY, callback) {

		let pointInCanvasLeft = mouseX-this.offset.left,
			pointInCanvasTop = mouseY-this.offset.top;
		// 筛选出鼠标所在连线起点与终点确定的矩形区域并根据公式计算出点是否在线条附近
		for(let p of this.paths){
			if(p.path.isPointAroundPath(pointInCanvasLeft, pointInCanvasTop)){
				this.activedLine = p;
				callback && callback(p);
				return ;	
			}
		}
		this.activedLine = null;
		callback && callback(null);
		// console.log(this.paths);
	}
	findActiveShape(mouseX, mouseY, callback) {

		let lastActivedShape = this.activedShape;
		this.dotInfo = null;
		// 检查上次选中的图形中是否选择连线结点
		if(lastActivedShape){
			// console.log(mouseX-this.offset.left, mouseY-this.offset.top);
			this.dotInfo = lastActivedShape.isPointInDots(mouseX-this.offset.left, mouseY-this.offset.top);
		}
		// console.log(dot)
		if(this.dotInfo){
			// 被选中的点所在图形的位置
			this.pathStart.direction = this.dotInfo.direction;
			callback && callback(this.activedShape, this.dotInfo.dot);
		}else{
			// 检查画布的图形上是否有落点
			for(var i=this.shapes.length-1;i>=0;i--){
				// 将鼠标位置转为相对画布的位置并判断落点
				if(this.shapes[i].isPointInPath(mouseX-this.offset.left, mouseY-this.offset.top)){
					this.activedShape = this.shapes[i];
					this.activedLine && this.activedLine.path.setColor();
					this.activedLine = null;
					callback && callback(this.activedShape);
					break;
				}
			}
			if(i < 0){
				this.activedShape = null;
				callback && callback();
			}
			// 新选中了别的图形或者画布
			if(lastActivedShape && this.activedShape !== lastActivedShape){
				lastActivedShape.setBorderColor();
				this.repaint();
			}
		}
	}
	setCursorAtEnd(DOMElement) {
		// 设置光标
		let selection = window.getSelection();
		let range = selection.getRangeAt(0);
		range.selectNode(DOMElement);
		range.setStart(range.startContainer.firstChild, range.startContainer.firstChild.innerHTML.length);
		range.collapse(true);
		selection.removeAllRanges();
		selection.addRange(range);	
	}
	initEvents() {
		// 绑定画布的事件
		this.frontCanvas.oncontextmenu = (e)=>{
			e.preventDefault();
			let startX = e.pageX, startY = e.pageY;
			this.findActiveShape(startX, startY);
			this.menu.show({startX: startX, startY: startY});
			e.stopPropagation();
		};
		let onmousemove, line = {};
		this.frontCanvas.addEventListener('mousedown', (e)=>{
			this.offset = this.countOffset(this.frontCanvas);
			// 避免鼠标超出边界后回来，事件没有注销
			onmousemove && this.frontCanvas.removeEventListener('mousemove', onmousemove);
			let startX = e.pageX, startY = e.pageY;
			this.menu.hide();
				// 由于层级覆盖，先检查上层的图形
			if(e.button === 0){ // 鼠标左键
				this.findActiveShape(startX, startY, (activedShape, activedDot)=>{
					if(!activedShape){
						// 全局拖动
						onmousemove= (e)=>{
							this.move=true;
							this.repaint(e.pageX-startX, e.pageY-startY);	

							this.event.emit('mousemove', e);
						};
					}else{
						onmousemove = (e)=>{

							if(this.drawLine && line.path){
								// 连线的末端点移动
								line.path.close({x: e.pageX- this.offset.left, y: e.pageY-this.offset.top});
							}else{
								this.activedShape && this.activedShape.setPosition(e.pageX-startX, e.pageY-startY);
							}
							this.repaint();
							if(this.drawLine){
								// 仅在连线的时候检测鼠标移动过程中碰到的图形和点，防止因鼠标移动导致activeShape被替换
								this.findActiveShape(e.pageX, e.pageY, (activedShape, activedDot)=>{
									// 在连线的过程中碰到了图形，则显示连接点
									if(activedShape){
										activedShape.drawDots();
										line.endShapeId = activedShape.id;
									}
									if(activedDot){
										// 检查连接点是否在该图形内
										// 确定该点的位置(小于0为未找到 or 大于0为找到)，创建连线
										if(activedShape.id != line.startShapeId){
											line.endDot = activedShape.findDot(activedDot)
										}else{
											line.endDot = -1;
										}

									}
								});
							}else{
								// 非连线状态
								if(activedShape){
									// 重新定位连线结点并绘制
									activedShape.drawDots();
								}
							}

							this.event.emit('mousemove', e);
						};
					}
					if(this.drawLine && activedDot){
						// 绘制连接点标亮的状态
						activedDot.setBackgroundColor('#ff0000');
						activedDot.draw({x: activedDot.position.x+activedDot.width/2, y: activedDot.position.y+activedDot.height/2});

						line = this.addLine({x: e.pageX- this.offset.left, y: e.pageY-this.offset.top});
					}
					this.frontCanvas.addEventListener('mousemove', onmousemove);

				});
			}
			if(!this.drawLine && !this.activedShape){
				this.findActiveLine(startX, startY, (activedLine)=>{
					for(let p of this.paths){
						p.path.setColor();
					}
					activedLine && activedLine.path.setColor('#ff0000');
				});
			}

			this.event.emit('mousedown', e);
		});
		this.frontCanvas.addEventListener('dblclick', (e)=>{
			if(this.activedShape){
				this.activedShape.isShow = false;
				this.repaint();
				// 先会出发两次mousedown，然后触发dblclick
				this.renamingShape = this.activedShape;
				let {position: {x, y}, width, height, data, font: {size}} = this.renamingShape.exportMetaData();
				this.renameInput.innerHTML = data.text;
				this.renameInput.style.cssText = `top:${y}px; left:${x}px; width:${width}px; min-height:${this.renamingShape.initial.height}px; z-index:999999; font-size:${size}px; visibility:visible;`;
				// 设置光标位置
				this.setCursorAtEnd(this.renameInput);			
			}
			this.event.emit('dblclick', e);
		});
		this.frontCanvas.addEventListener('mouseup', (e)=>{
			this.frontCanvas.removeEventListener('mousemove', onmousemove);
			this.activedShape && this.activedShape.drop();

			// 处于连线状态
			this.drawLine = false;
			// 处于移动图形状态
			if(this.move){
				for(let s of this.shapes){
					s.drop();
				}
				this.move = false;
			}
			this.pathStart = {};
			if(line.path && (line.endDot < 0 || line.endShapeId == line.startShapeId)){
				this.deleteLine(line);
			}
			line = {};
			this.frontCanvas.style.cursor='default';
			let startX = e.pageX, startY = e.pageY;
			this.findActiveShape(startX, startY, (activedShape)=>{
				if(activedShape){
					activedShape.setBorderColor('#ff0000');
				}
				this.repaint();
			});

			this.event.emit('mouseup', e);
		});
		this.frontCanvas.addEventListener('drop', (e)=>{
			e.preventDefault();
			this.offset = this.countOffset(this.frontCanvas);

			let dataString = e.dataTransfer.getData('text');
			try{
				let data = JSON.parse(dataString);
				if(typeof data.text == 'undefined'){
					console.error(`invalid data widthout text property`);
					return ;
				}
				this.addShape('Rectangle', {
					x: e.pageX-this.offset.left,
					y: e.pageY-this.offset.top,
					data,
					canvasContext: this.frontCtx,
					color: this.shapeOption.color, 
					backgroundColor: this.shapeOption.backgroundColor, 
					font: this.shapeOption.font
				});
				this.event.emit('drop', e);
			}catch(e){
				console.error(`invalid data width '${dataString}'`);
			}
			// console.log(e.pageX,e.pageY,this.offset)
		});
		this.frontCanvas.addEventListener('dragover', (e)=>{
			e.preventDefault();
			this.event.emit('dragover', e);
		});
	}
	destroy() {
		this.container.removeChild(this.bgCanvas);
		this.container.removeChild(this.frontCanvas);
		this.frontCanvas=null;
		this.bgCanvas=null;
		this.containerParent=null;
		this.container=null;
		this.frontCtx=null;
		this.bgCtx=null;
		this.shapes=[];
		this.paths=[];
		this.menu.destroy();
		this.menu=null;
		this.event.destroy();
		this.event=null;
		window.removeEventListener('resize', this.resizeFn);
		this.renameInput=null;
	}
	initBackground() {
		// 绘制背景网格线
		const GRID_INTERVAL = 10, 
					GRIDROWS = this.bgCanvas.height / GRID_INTERVAL, 
					GRIDCOLS = this.bgCanvas.width / GRID_INTERVAL;
		this.bgCtx.save();
		this.bgCtx.translate(0.5, 0.5);
		this.bgCtx.lineWidth=0.2;
		this.bgCtx.strokeStyle='#dddddd';
		this.bgCtx.moveTo(0, 0);
		for(var i=1;i<GRIDROWS;i++){
			this.bgCtx.beginPath();
			this.bgCtx.moveTo(0, i*GRID_INTERVAL);
			this.bgCtx.lineTo(this.bgCanvas.width, i*GRID_INTERVAL);
			this.bgCtx.stroke();
			this.bgCtx.closePath();
		}
		this.bgCtx.moveTo(0, 0);
		for(var i=1;i<GRIDCOLS;i++){
			this.bgCtx.beginPath();
			this.bgCtx.moveTo(i*GRID_INTERVAL, 0);
			this.bgCtx.lineTo(i*GRID_INTERVAL, this.bgCanvas.height);
			this.bgCtx.stroke();
			this.bgCtx.closePath();
		}
		this.bgCtx.restore();

	}
	countOffset(DOMElement) {
		let left = 0,top = 0;
		// console.log(DOMElement.offsetParent)
		if(DOMElement.offsetParent){
			({left, top} = this.countOffset(DOMElement.offsetParent));
		}
		left += DOMElement.offsetLeft;
		top += DOMElement.offsetTop;
		// console.log(left,top)
		return {left, top};
	}
	// x,y为鼠标移动值
	repaint(x = 0,y = 0) {
		this.frontCtx.clearRect(0, 0, this.width, this.height);
		
		// 绘制路径
		for(let r of this.paths){
			// 有确定的起止点，已完成的连线
			if(r.startShapeId && r.endShapeId){
				let sdot,edot;
				for(let s of this.shapes){
					if(s.id===r.startShapeId){
						sdot = s.findDotByIndex(r.startDot);
					}
					if(s.id===r.endShapeId){
						edot = s.findDotByIndex(r.endDot);
					}
				}
				if(sdot && edot && sdot != edot){
					let pathStart = {x: sdot.position.x, y: sdot.position.y},
						pathEnd = {x: edot.position.x, y: edot.position.y};
					if(this.move){
						pathStart.x+=x;
						pathStart.y+=y;

						pathEnd.x+=x;
						pathEnd.y+=y;
					}
					r.path.begin(pathStart);
					r.path.close(pathEnd);
				}
			}
				r.path.draw();
		}
		// 绘制图形
		for(let s of this.shapes){
			if(s.isShow){
				if(this.move){
					s.setPosition(x, y);
				}
				s.draw();
			}
		}
	}
	deleteShape(shape) {
		// 删除图形及其相关的连线
		for(var i=0;i<this.shapes.length;i++){
			if(shape.id === this.shapes[i].id){
				this.shapes.splice(i,1);
				// splice会改变数组长度，从后往前删除不会受长度变化影响
				for(let j=this.paths.length-1;j>-1;j--){
					if(this.paths[j] && (this.paths[j].startShapeId===shape.id || this.paths[j].endShapeId===shape.id)){
						this.deleteLine(this.paths[j]);
					}
				}
				this.repaint();
			}
		}
	}
	addShape(type, ...params) {
		if(!params[0].id){
			params[0].id=incrementalId++;
		}
		let shape = Reflect.construct(this.shapeRule[type], params);
		this.shapes.push(shape);
		return shape;
	}
	addLine(...params) {		
		// 记录连线的关系，所连图形的
		let line = new Line({
			id: incrementalId++,
			canvasContext: this.frontCtx,
			startShapeId: this.pathStart.shape.id,
			endShapeId: null,
			pathParams: params,
			startDot: this.dotInfo.direction,
			endDot: -1 // 默认无连接点
		});
		this.paths.push(line);
		return line;
	}
	deleteLine(line, needRepaint = false) {
		this.paths.splice(this.paths.indexOf(line), 1);
		needRepaint && this.repaint();
	}
	hasShape() {
		return this.shapes.length > 0?true:false;
	}
	exportCanvasData() {
		// 如果存在图形则导出数据，不存在则返回null
		if(this.hasShape()) {
			let metaData = {
				shapes:[],
				lines:[]
			};
			// 导出图形
			for(let s of this.shapes){
				// 重置边框颜色
				s.setBorderColor();
				metaData.shapes.push(s.exportMetaData());
			}
			// 导出连线
			for(let p of this.paths){
				metaData.lines.push(p.exportMetaData());
			}
			return metaData;
		} else {
			return null;
		}
	}
	importCanvasData(metaData) {
		this.reset();
		// 记录导入数据后的id值
		let finalId=0;
		// 导入图形
		for(let s of metaData.shapes){
			s['canvasContext'] = this.frontCtx;
			s.x=s.position.x+s.width/2;
			s.y=s.position.y+s.height/2;
			if(s.id > finalId){
				finalId=s.id;
			}
			this.addShape(s.shape, s);
		}
		// 导入连线
		for(let l of metaData.lines){
			l['canvasContext'] = this.frontCtx;
			if(l.id > finalId){
				finalId=l.id;
			}
			let line = Reflect.construct(this.shapeRule[l.shape], [l]);
			this.paths.push(line);
		}
		this.repaint();
		// 确定下次的id起始值
		incrementalId = finalId+1;
	}
	reset() {
		this.frontCtx.clearRect(0, 0, this.width, this.height);
		this.shapes=[];
		this.paths=[];
		incrementalId=1;
	}
	saveAsImage() {
		let tmpCanvas = document.createElement('canvas');
		tmpCanvas.width=this.frontCanvas.width;
		tmpCanvas.height=this.frontCanvas.height;
		let tmpCtx = tmpCanvas.getContext('2d');

		tmpCtx.fillStyle = '#ffffff';
		tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
		for(let p of this.paths){
			p.path.draw(tmpCtx);
		}
		for(var s of this.shapes){
			s.draw(tmpCtx);
		}

		let image = new Image();
		image.src = tmpCanvas.toDataURL('image/png');
		return image;
	}
}