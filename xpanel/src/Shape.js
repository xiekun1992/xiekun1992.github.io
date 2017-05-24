class Shape {
	constructor({id, color = '#000000', backgroundColor = '#ffffff', borderColor = '#000000', font = {}}) {
		this.color = color;
		this.backgroundColor = backgroundColor;
		this.borderColor = borderColor;
		this.id=id;
		this.isShow=true;
		this.shape='Shape';

		this.font = {
			size: 18,
			// family: 'Helvetica'
			family: 'Microsoft yahei'
		};
		this.font = Object.assign(this.font, font);
	}
	setColor(color = '#000000') {
		this.color = color;
	}
	setBackgroundColor(color = '#ffffff') {
		this.backgroundColor = color;
	}
	setBorderColor(color = '#000000') {
		this.borderColor = color;
	}
	getFont() {
		return `${this.font.size}px ${this.font.family}`;
	}
	setFont({size, family} = this.font) {
		this.font.size = size;
	}
	isPointInPath(x, y) {
		// x, y 为相对画布的位置
		// console.log(this.position.x, this.position.y, this.width, this.height)
		return this.position.x<=x && x<=(this.position.x+this.width) && this.position.y<=y && y<=(this.position.y+this.height)?true:false;
	}
	exportMetaData() {
		return {
			id: this.id,
			color: this.color,
			backgroundColor: this.backgroundColor,
			borderColor: this.borderColor,
			shape: this.shape
		}
	}
	// 折叠长文本，换行显示
	// longText 包含富文本
	foldLongText(longText, maxWidth, ctx) {
		// 处理富文本，转为普通文本
		longText = longText.replace(/^<div>/,'').replace(/<\/div>|<br>/g,'').replace(/&nbsp;/g,' ').split(/<div>/);
		// 处理普通文本
		let lines=[];
		longText.forEach(function(text, j){
			let starti=0, line='';
			for(let i=0; i<text.length; i++){
				console.log(ctx.measureText(line).width);
				line += text.charAt(i);
				if(ctx.measureText(line).width > maxWidth){
					console.info(ctx.measureText(line).width, maxWidth);
					starti = line.length-1;
					lines.push(line.slice(0, starti));
					line = line.slice(starti);
				}
			}
			console.info(ctx.measureText(line).width, maxWidth);
			// 保存最后一行
			lines.push(line);
		});
		return lines;
	}
}

export class Rectangle extends Shape {
	// x,y表示鼠标相对画布所在位置, position.x,position.y为图形相对画布位置
	constructor({id, x = 10, y = 10, width = 80, height = 40, data, canvasContext, color, backgroundColor, borderColor, font}) {
		// console.log(x,y)
		super({id, color, backgroundColor, borderColor, font});
		this.shape='Rectangle';
		// 设置默认宽高
		this.initial={height, width};

		this.width = width;
		this.height = height;
		this.position = {x: x-width/2, y: y-height/2, originX: x-width/2, originY: y-height/2};
		this.data = data;
		this.text = this.data.text || '';
		// this.ctx = canvasContext;
		this.setContext(canvasContext);
		this.draw();
	}
	resetDimension(){
		this.width = this.initial.width;
		this.height = this.initial.height;
	}
	setDimension({width = this.width, height = this.height} = this.initial) {
		this.width = width;
		this.height = height;
	}
	setText(text = this.text) {
		this.text=text;
	}
	setContext(ctx) {
		this.ctx = ctx;
		this.dots = [
			new Dot({x: this.position.x+this.width/2, y: this.position.y, canvasContext: this.ctx, borderColor: '#ff0000'}), // 上
			new Dot({x: this.position.x+this.width, y: this.position.y+this.height/2, canvasContext: this.ctx, borderColor: '#ff0000'}), // 右
			new Dot({x: this.position.x+this.width/2, y: this.position.y+this.height, canvasContext: this.ctx, borderColor: '#ff0000'}), // 下
			new Dot({x: this.position.x, y: this.position.y+this.height/2, canvasContext: this.ctx, borderColor: '#ff0000'}) // 左
		];
	}
	setPosition(x, y) {
		this.position.x = this.position.originX + x;
		this.position.y = this.position.originY + y;
	}
	drop() {
		this.position.originX = this.position.x;
		this.position.originY = this.position.y;
		
		this.dots[0].setPosition({x: this.position.x+this.width/2, y: this.position.y});
		this.dots[1].setPosition({x: this.position.x+this.width, y: this.position.y+this.height/2});
		this.dots[2].setPosition({x: this.position.x+this.width/2, y: this.position.y+this.height});
		this.dots[3].setPosition({x: this.position.x, y: this.position.y+this.height/2});
	}
	clear() {
		this.ctx.clearRect(this.position.x-1, this.position.y-1, this.width+2, this.height+2);
	}
	draw(ctx = this.ctx) {
		ctx.beginPath();
		ctx.fillStyle = this.backgroundColor;
		ctx.textAlign='center';
		ctx.textBaseline='top';
		// ctx.shadowBlur=2;
		// ctx.shadowColor=this.borderColor || '#bbb';
		ctx.lineWidth=1;

		ctx.strokeStyle = this.color;
		ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
		// ctx.fill();
		// ctx.stroke();
		ctx.strokeStyle = this.borderColor;
		ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
		ctx.shadowBlur=0;
		ctx.fillStyle=this.color;
		ctx.font=this.getFont();
		// 处理长文本换行
		let textArray = this.foldLongText(this.text, this.width, ctx);
		if(textArray.length===1){
			ctx.textBaseline='middle';
			ctx.fillText(textArray[0], this.position.x+this.width/2, (this.position.y+this.height/2), this.width);
		}else{
			textArray.forEach((o, i)=>{
				ctx.fillText(o, this.position.x+this.width/2, (this.position.y)+(this.font.size*1.05)*i, this.width);				
			});
		}
		ctx.closePath();
	}
	drawDots() {
		for(let d of this.dots){
			d.resetColor();
		}
		this.dots[0].draw({x: this.position.x+this.width/2, y: this.position.y});
		this.dots[1].draw({x: this.position.x+this.width, y: this.position.y+this.height/2});
		this.dots[2].draw({x: this.position.x+this.width/2, y: this.position.y+this.height});
		this.dots[3].draw({x: this.position.x, y: this.position.y+this.height/2});
	}
	findDot(dot) {
		return this.dots.indexOf(dot);
	}
	findDotByIndex(index){
		return this.dots[index];
	}
	isPointInDots(x, y){
		// x, y 为相对画布的位置
		for(let i=0;i<this.dots.length;i++){
			if(this.dots[i].isPointInPath(x, y)){
				return {dot: this.dots[i], direction: i};
			}
		}
	}
	exportMetaData() {
		let superMetaData = super.exportMetaData();
		this.data.text=this.text;
		return Object.assign(superMetaData, {position: { x: this.position.x, y: this.position.y }, width: this.width, height: this.height, data: this.data, font: this.font});
		
	}
}

class Dot extends Shape {
	constructor({id, x, y, width = 8, height = 8, canvasContext, color, backgroundColor, borderColor, font}) {
		super({color, backgroundColor, borderColor, font});
		this.shape='Dot';
		// this.position = {x: x - width/2, y: y - height/2};
		this.width = width;
		this.height = height;
		this.ctx = canvasContext;
		this.center = {x, y};
		this.setPosition({x,y});
	}
	setPosition({x,y}) {
		this.position = {x: x - this.width/2, y: y - this.height/2};
	}
	resetColor() {
		this.setBackgroundColor();
		this.setBorderColor('#ff0000');
		this.setColor();
	}
	draw(position = {x: this.position.x, y: this.position.y}) {
		this.ctx.beginPath();
		this.ctx.strokeStyle = this.borderColor;
		this.ctx.fillStyle = this.backgroundColor;
		this.ctx.rect(position.x - this.width/2, position.y - this.height/2, this.width, this.height);
		this.ctx.stroke();
		this.ctx.fill();
		this.ctx.closePath();
		this.position = {x: position.x - this.width/2, y: position.y - this.height/2};
	} 
}

export class Line extends Shape {
	constructor({id, canvasContext, startShapeId, endShapeId, startDot, endDot, pathParams, font}) {
		super({id, font});
		this.shape='Line';
		pathParams.unshift(canvasContext);
		this.path = Reflect.construct(Path, pathParams);
		this.startShapeId=startShapeId;
		this.endShapeId=endShapeId;
		this.startDot=startDot;
		this.endDot=endDot;
	}
	exportMetaData() {
		let superMetaData = super.exportMetaData();
		return Object.assign(superMetaData, {
			startShapeId: this.startShapeId, 
			endShapeId: this.endShapeId, 
			startDot: this.startDot, 
			endDot: this.endDot, 
			pathParams: this.path.exportMetaData()
		});
	}
}

class Path {
	// lines为二元坐标的数组
	constructor(canvasContext, ...lines) {
		this.lines = lines;
		this.ctx = canvasContext;
		this.defaultColor = '#555555';
		this.color = this.defaultColor;
		// this.id=incrementalId++;
	}
	setColor(color = this.defaultColor) {
		this.color = color;
	}
	begin({x, y}) {
		this.lines[0] = {x:x+4, y:y+4};
	}
	close({x, y}) {
		if(this.lines.length > 2){
			this.lines[this.lines.length-1] = {x:x+4, y:y+4};
		}else{
			this.lines.push({x:x+4, y:y+4});
		}
	}
	add({x, y}) {
		this.lines.push({x:x+4, y:y+4});
	}
	// drawLine() {
	// 	this.ctx.strokeStyle = '#000000';
	// 	this.ctx.lineWidth = 1;
	// 	this.ctx.beginPath();
	// 	this.ctx.moveTo(this.lines[0].x, this.lines[0].y);
	// 	for(var l of this.lines.slice(1)){
	// 		this.ctx.lineTo(l.x, l.y);
	// 	}
	// 	this.ctx.stroke();
	// 	this.ctx.closePath();
	// }
	// 绘制二阶贝塞尔曲线
	draw(ctx = this.ctx) {
		ctx.strokeStyle = this.color;
		ctx.lineWidth = 1;
		ctx.beginPath();
		let startX = this.lines[0].x, 
			startY = this.lines[0].y,
			endX = this.lines[this.lines.length-1].x, 
			endY = this.lines[this.lines.length-1].y;
		// 检测连接点相对位置情况来修改连接线的类型
		// switch(true){
			// 终点在右上方，三阶贝塞尔曲线，以终点为起点绘制
			// case (startX > endX && startY < endY): 
			// 	this.ctx.moveTo(endX, endY);
			// 	this.ctx.bezierCurveTo(startX, endY, endX, startY, startX, startY);
			//  	break;
			// 终点在左上方，三阶贝塞尔曲线，以起点绘制
			// case (startX < endX && startY < endY): 
			// 	this.ctx.moveTo(startX, startY);
			// 	this.ctx.bezierCurveTo(endX, startY, startX, endY, endX, endY);
			//  	break;
			// default:
				ctx.moveTo(startX, startY);
				ctx.quadraticCurveTo(endX, startY, endX, endY);
		// }
		ctx.stroke();
		ctx.closePath();
	}
	isPointAroundPath(pointInCanvasLeft, pointInCanvasTop) {
		let sx = this.lines[0].x,
			sy = this.lines[0].y,
			ex = this.lines[this.lines.length-1].x,
			ey = this.lines[this.lines.length-1].y;

		// 根据二阶贝塞尔曲线公式确定理论上y的位置
		for(let t=0;t<=1;t+=0.01){
			let x = Math.pow(1-t,2)*sx+2*t*(1-t)*ex+t*t*ex;
			if(pointInCanvasLeft-2 <=x && x <= pointInCanvasLeft+2){
				let y = Math.pow(1-t,2)*sy+2*t*(1-t)*sy+t*t*ey;
				if(pointInCanvasTop-2 <=y && y <= pointInCanvasTop+2){
					// console.log(`y ${pointInCanvasTop} ${y} find`);
					return true;
				}
			}
		}
		return false;
	}
	exportMetaData() {
		return this.lines;
	}
}