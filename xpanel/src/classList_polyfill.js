(function(){
function i(e){
this.el=e;var n=e.className.replace(/^\s+|\s+$/g,"").split(/\s+/);for(var r=0;r<n.length;r++)t.call(this,n[r])
}function s(e,t,n){
Object.defineProperty?Object.defineProperty(e,t,{
get:n
}):e.__defineGetter__(t,n)
}if(typeof window.Element=="undefined"||"classList"in document.documentElement)return;var e=Array.prototype,t=e.push,n=e.splice,r=e.join;i.prototype={
add:function(e){
if(this.contains(e))return;t.call(this,e),this.el.className=this.toString()
},contains:function(e){
return this.el.className.indexOf(e)!=-1
},item:function(e){
return this[e]||null
},remove:function(e){
if(!this.contains(e))return;for(var t=0;t<this.length;t++)if(this[t]==e)break;n.call(this,t,1),this.el.className=this.toString()
},toString:function(){
return r.call(this," ")
},toggle:function(e){
return this.contains(e)?this.remove(e):this.add(e),this.contains(e)
}
},window.DOMTokenList=i,s(HTMLElement.prototype,"classList",function(){
return new i(this)
})
})()