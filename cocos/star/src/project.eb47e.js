window.__require=function t(e,i,n){function s(c,r){if(!i[c]){if(!e[c]){var a=c.split("/");if(a=a[a.length-1],!e[a]){var h="function"==typeof __require&&__require;if(!r&&h)return h(a,!0);if(o)return o(a,!0);throw new Error("Cannot find module '"+c+"'")}c=a}var u=i[c]={exports:{}};e[c][0].call(u.exports,function(t){return s(e[c][1][t]||t)},u,u.exports,t,e,i,n)}return i[c].exports}for(var o="function"==typeof __require&&__require,c=0;c<n.length;c++)s(n[c]);return s}({Game:[function(t,e,i){"use strict";cc._RF.push(e,"b8185CE7jlO94pgdgUc72ZQ","Game"),cc.Class({extends:cc.Component,properties:{starPrefab:{default:null,type:cc.Prefab},scoreFXPrefab:{default:null,type:cc.Prefab},maxStarDuration:0,minStarDuration:0,ground:{default:null,type:cc.Node},player:{default:null,type:cc.Node},scoreDisplay:{default:null,type:cc.Label},scoreAudio:{default:null,type:cc.AudioClip},btnNode:{default:null,type:cc.Node},gameOverNode:{default:null,type:cc.Node}},onStartGame:function(){this.resetScore(),this.enabled=!0,this.btnNode.x=3e3,this.gameOverNode.active=!1,this.player.getComponent("Player").startMoveAt(cc.v2(0,this.groundY)),this.spawnNewStar()},spawnNewStar:function(){var t=null;t=this.starPool.size()>0?this.starPool.get(this):cc.instantiate(this.starPrefab),this.node.addChild(t),t.setPosition(this.getNewStarPosition()),t.getComponent("Star").init(this),this.startTimer(),this.currentStar=t},despawnStar:function(t){this.starPool.put(t),this.spawnNewStar()},startTimer:function(){this.starDuration=this.minStarDuration+Math.random()*(this.maxStarDuration-this.minStarDuration),this.timer=0},getNewStarPosition:function(){this.currentStar||(this.currentStarX=2*(Math.random()-.5)*this.node.width/2);var t=0,e=this.groundY+Math.random()*this.player.getComponent("Player").jumpHeight+50,i=this.node.width/2;return t=this.currentStarX>=0?-Math.random()*i:Math.random()*i,this.currentStarX=t,cc.v2(t,e)},resetScore:function(){this.score=0,this.scoreDisplay.string="Score: "+this.score.toString()},gainScore:function(t){this.score+=1,this.scoreDisplay.string="Score: "+this.score;var e=this.spawnScoreFX();this.node.addChild(e.node),e.node.setPosition(t),e.play(),cc.audioEngine.playEffect(this.scoreAudio,!1)},spawnScoreFX:function(){var t;return this.scorePool.size()>0?(t=this.scorePool.get()).getComponent("ScoreFX"):((t=cc.instantiate(this.scoreFXPrefab).getComponent("ScoreFX")).init(this),t)},despawnScoreFX:function(t){this.scorePool.put(t)},gameOver:function(){this.player.enabled=!1,this.player.getComponent("Player").stopMove(),this.currentStar.destroy(),this.gameOverNode.active=!0,this.btnNode.x=0},onLoad:function(){this.timer=0,this.currentStar=null,this.currentStarX=0,this.groundY=this.ground.y+this.ground.height/2,this.enabled=!1,this.starDuration=0,this.starPool=new cc.NodePool("Star"),this.scorePool=new cc.NodePool("ScoreFX")},start:function(){},update:function(t){if(this.timer>this.starDuration)return this.gameOver(),void(this.enabled=!1);this.timer+=t}}),cc._RF.pop()},{}],Player:[function(t,e,i){"use strict";cc._RF.push(e,"e210ajmHdNFQ52FXaoQNWUX","Player"),cc.Class({extends:cc.Component,properties:{jumpHeight:0,jumpDuration:0,maxMoveSpeed:0,accel:0,squashDuration:0,jumpAudio:{default:null,type:cc.AudioClip}},stopMove:function(){this.node.stopAllActions(),this.xSpeed=0,this.enabled=!1},startMoveAt:function(t){this.enabled=!0,this.xSpeed=0,this.node.setPosition(t),this.node.runAction(this.setJumpAction())},playJumpSound:function(){cc.audioEngine.playEffect(this.jumpAudio,!1)},setJumpAction:function(){var t=cc.moveBy(this.jumpDuration,cc.v2(0,this.jumpHeight)).easing(cc.easeCubicActionOut()),e=cc.moveBy(this.jumpDuration,cc.v2(0,-this.jumpHeight)).easing(cc.easeCubicActionIn()),i=cc.scaleTo(this.squashDuration,1,.6),n=cc.scaleTo(this.squashDuration,1,1.2),s=cc.scaleTo(this.squashDuration,1,1),o=cc.callFunc(this.playJumpSound,this);return cc.repeatForever(cc.sequence(i,n,t,s,e,o))},onKeyDown:function(t){switch(t.keyCode){case cc.macro.KEY.a:this.accLeft=!0;break;case cc.macro.KEY.d:this.accRight=!0}},onKeyUp:function(t){switch(t.keyCode){case cc.macro.KEY.a:this.accLeft=!1;break;case cc.macro.KEY.d:this.accRight=!1}},onLoad:function(){this.enabled=!1,this.accLeft=!1,this.accRight=!1,this.xSpeed=0,this.jumpAction=this.setJumpAction(),cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,this.onKeyDown,this),cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP,this.onKeyUp,this)},onDestroy:function(){cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN,this.onKeyDown,this),cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP,this.onKeyUp,this)},start:function(){},update:function(t){this.accLeft?this.xSpeed-=this.accel*t:this.accRight&&(this.xSpeed+=this.accel*t),Math.abs(this.xSpeed)>this.maxMoveSpeed&&(this.xSpeed=this.maxMoveSpeed*this.xSpeed/Math.abs(this.xSpeed)),this.node.x+=this.xSpeed*t,this.node.x+this.node.width/2>this.node.parent.width/2?(this.node.x=this.node.parent.width/2-this.node.width/2,this.xSpeed=0):this.node.x-this.node.width/2<-this.node.parent.width/2&&(this.node.x=-this.node.parent.width/2+this.node.width/2,this.xSpeed=0)}}),cc._RF.pop()},{}],ScoreAnim:[function(t,e,i){"use strict";cc._RF.push(e,"ec026vhPdhFsqzCcUkJV6tq","ScoreAnim"),cc.Class({extends:cc.Component,properties:{},init:function(t){this.scoreFX=t},hideFX:function(){this.scoreFX.despawn()},start:function(){}}),cc._RF.pop()},{}],ScoreFX:[function(t,e,i){"use strict";cc._RF.push(e,"40fdcxtG3pD8Yr+GbVkaR5N","ScoreFX"),cc.Class({extends:cc.Component,properties:{anim:{default:null,type:cc.Animation}},init:function(t){this.game=t,this.anim.getComponent("ScoreAnim").init(this)},despawn:function(){this.game.despawnScoreFX(this.node)},play:function(){this.anim.play("score_pop")},start:function(){}}),cc._RF.pop()},{}],Star:[function(t,e,i){"use strict";cc._RF.push(e,"d8a5flIHcxD1JG2t4VvT8b9","Star"),cc.Class({extends:cc.Component,properties:{pickRadius:0},getPlayerDistance:function(){var t=this.game.player.getPosition();return this.node.position.sub(t).mag()},onPicked:function(){var t=this.node.getPosition();this.game.gainScore(t),this.game.despawnStar(this.node)},init:function(t){this.game=t,this.enabled=!0,this.node.opacity=255},reuse:function(t){this.init(t)},onLoad:function(){this.enabled=!1},start:function(){},update:function(t){if(this.getPlayerDistance()<this.pickRadius)this.onPicked();else{var e=1-this.game.timer/this.game.starDuration;this.node.opacity=50+Math.floor(205*e)}}}),cc._RF.pop()},{}],"use_v2.0.x_cc.Toggle_event":[function(t,e,i){"use strict";cc._RF.push(e,"f4534Np03tCBKe6Mo5xskJr","use_v2.0.x_cc.Toggle_event"),cc.Toggle&&(cc.Toggle._triggerEventInScript_check=!0),cc._RF.pop()},{}]},{},["use_v2.0.x_cc.Toggle_event","Game","Player","ScoreAnim","ScoreFX","Star"]);