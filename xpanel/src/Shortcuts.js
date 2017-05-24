/**
 * 定义快捷键
 */

export class Shortcuts {
	constructor(domElement){
		domElement.addEventListener('keydown',this.keyup);
		domElement.addEventListener('keyup',this.keydown);
		this.shortcuts={
			'ArrowUp':{callback() {

			},description:'↑'},
			'ArrowDown':{callback() {

			},description:'↓'},
			'ArrowLeft':{callback() {

			},description:'←'},
			'ArrowRight':{callback() {

			},description:'→'}
		};
	}
	set({key,description,callback}){
		this.shortcuts[key.toLowerCase()]={callback,description};
	}
	get(){
		let shortcuts=[];
		for(let s in this.shortcuts){
			shortcuts.push({name:s,desc:this.shortcuts[s].description});
		}
		return shortcuts;
	}
	keydown() {

	}
	keyup() {

	}
}