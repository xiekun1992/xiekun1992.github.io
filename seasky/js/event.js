(function(factory){
	if(!this._x){
		this._x = {};
	}
	this._x.Event = factory();
	this._x.event = new this._x.Event();
})(function(){
	function Event(){
		this.events = {};
	}
	Event.prototype.on = function(eventName, cb){
		if(!this.events[eventName]){
			this.events[eventName] = [];
		}
		this.events[eventName].push(cb);
	}
	Event.prototype.trigger = function(eventName, args){
		if(this.events[eventName]){
			this.events[eventName].forEach(function(o){
				o(args);
			});
		}
	}
	return Event;
});