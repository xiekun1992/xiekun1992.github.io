(function($){
	"use strict";

	function Carousel(options){
		var defaultOptions={
			interval:5000,
			autoPlay:true
		};
		// this.showElement=
		console.log($(this))
	}
	Carousel.prototype.pre=function(){

	};
	$.fn.extend({
		"carousel":Carousel
	});
})(window.jQuery);