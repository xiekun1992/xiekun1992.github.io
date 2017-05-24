// 事件发布订阅器
export default class Event {
	constructor() {
		this.events={};
	}
	on(eventName, callback) {
		!this.events[eventName] && (this.events[eventName]=[]);
		// 可重复注册回调函数
		this.events[eventName].push(callback);
	}
	emit(eventName, event) {
		this.events[eventName] && this.events[eventName].forEach(function(o){
			o(event);
		});
	}
	remove(eventName, callback) {
		// 从后往前遍历删除，防止改变数组长度后i值未跟随变化导致的误删
		for(let i = this.events[eventName].length - 1 ; i>=0 ; i--){
			if(this.events[eventName][i] === callback){
				this.events[eventName].splice(i, 1);
				// 不立即退出，防止出现重复注册的回调
			}
		}
	}
	destroy() {
		this.events={};
	}
}