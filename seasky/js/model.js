(function(factory){
	if(!this._x){
		this._x = {};
	}
	this._x.Model = factory;
})(function(config){
	var container = document.createElement('div');
	container.setAttribute('class', 'clearfix model-container');
	document.body.appendChild(container);

	// config:[{id, path, name, desc}[, {id, path, name, desc}]*]
	// 模型切换按钮组
	var ul = document.createElement('ul');
	ul.setAttribute('class', 'model-nav');
	ul.setAttribute('id', 'modelNav');
	config.forEach(function(o, i){
		var li = document.createElement('li'),
			a = document.createElement('a');
		a.setAttribute('href', 'javascript:void(0)');
		a.innerText = o.name;
		a.onclick = function(){
			if(isloadingModel) return;

			for(var i = 0; i < ul.children.length; i++){
				if(ul.children[i] !== a.parentNode){
					ul.children[i].removeAttribute('class');
				}
			}
			a.parentNode.setAttribute('class', 'active');
			loadModel(o.path, o.id);
		}
		li.appendChild(a);
		ul.appendChild(li);
		if(i === 0){
			li.setAttribute('class', 'active');
		}
	});
	container.appendChild(ul);

	var isAnnotationShow = false;
	_x.event.on('annotation.change', changeAnnotation);
	function changeAnnotation(isShow){
		isAnnotationShow = isShow;
		var annotationArr = config.filter(function(m, i){
			return m.id === currentModel.id;
		}).pop().annotation;
		if(annotationArr && annotationArr.length > 0){
			if(isShow){
				// 显示标注，停止动画
				generateAnnotations(annotationArr, currentModel.model);
				
				if(currentModel.model && currentModel.model.animations[ 0 ]){
					currentModel.mixers.forEach(function(mixer){
						var action = mixer.clipAction( currentModel.model.animations[ 0 ] );
						action.stop();
					});
				}
				startAnimation = false;
			}else{
				// 显示标注，开启动画
				removeAnnotations();
				if(currentModel.model && currentModel.model.animations[ 0 ]){
					currentModel.mixers.forEach(function(mixer){
						var action = mixer.clipAction( currentModel.model.animations[ 0 ] );
						action.play();
					});
				}
				startAnimation = true;
			}
		}
	}

	_x.event.on('desc.change', changeDesc);
	function changeDesc(){
		var modelConfigInfo = config.filter(function(o){
			return o.id === currentModel.id;
		}).pop();
		document.getElementById('text').innerText = modelConfigInfo.desc;
	}

	// 3d模型展示
	var scene = new THREE.Scene(), clock = new THREE.Clock(), startAnimation = true;
	var fov = 45, camera = new THREE.PerspectiveCamera(fov, document.body.clientWidth/window.innerHeight, 0.1, 1000);
	var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(document.body.clientWidth, window.innerHeight);

	var controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 0, 0.1 );
	// camera.rotation.z = 0.4;
	// camera.position.set( 1, 1, 1 );
	// controls.enableZoom = false;
	// controls.minDistance = 4;
	// controls.maxDistance = 100;
	controls.update();

	container.appendChild(renderer.domElement);
	window.addEventListener('resize', onResize);
	window.addEventListener('orientationchange', onResize);
	function onResize(){
		// 解决IOS手机浏览器横竖屏切换不了的问题
		var timer = setTimeout(function(){
			camera.aspect = document.body.clientWidth / window.innerHeight;
			// camera.position.z = cube.boundingBox.max.distanceTo(cube.boundingBox.min) / Math.tan(22.5);
			camera.updateProjectionMatrix();
			renderer.setSize(document.body.clientWidth, window.innerHeight);
			
			clearTimeout(timer);
		}, 100);
	}


	var ambientLight = new THREE.AmbientLight(0xcccccc);
	scene.add(ambientLight);
	var directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
	directionalLight1.position.set(180.1, 163.8, 75);
	var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
	directionalLight1.position.set(-126.4, 100, 31.2);
	scene.add(directionalLight1);
	scene.add(directionalLight2);

	// 根据模型边界自动调整相机位置
	function cameraFocus(boundingBox){
		camera.lookAt(0, 0, 0);
		// camera.rotation.set(Math.PI / 6, Math.PI / 4, 0);
		// 由于OrbitControls 接管了camera，需要通过相应的方法设置相机的旋转
		controls.rotateLeft(Math.PI / 4); // y轴
		controls.rotateUp(Math.PI / 6); // x轴

		camera.position.set(0, 0, boundingBox.max.distanceTo(boundingBox.min) / Math.tan(fov / 2));
	}
	// 计算多层分组模型的边界框
	function getComplexBoundingBox(object3D) {
	    var box = null;
	    object3D.traverse(function(obj3D) {
	        if (obj3D.matrixWorldNeedsUpdate) obj3D.updateMatrixWorld();
	        var geometry = obj3D.geometry;
	        // If current is not a geometry (THREE.Geometry), proceed to the next one
	        if (geometry === undefined) return null;
	        // If this object is already bounding box, then use it
	        if (geometry.boundingBox) { 
	            var workableBox = geometry.boundingBox.clone();
	            // Move the resulting bounding box to the position of the object itself
	            workableBox.applyMatrix4(obj3D.matrixWorld);
	            if (box === null) {
	                box = workableBox;
	            } else {
	                box.union(workableBox);
	            }
	        // If there is no bounding box for current object - creating
	        } else {
	            var workableGeometry = geometry.clone();
	            // Move the resulting geometry in the position of the object itself
	            workableGeometry.applyMatrix(obj3D.matrixWorld);
	            // Calculate the bounding box for the resulting geometry
	            workableGeometry.computeBoundingBox();
	            if (box === null) {
	                box = workableGeometry.boundingBox;
	            } else {
	                box.union(workableGeometry.boundingBox);
	            }
	        }
	    });
	    return box;
	}

	function addDoubleSideMaterial(obj){
		if(obj.type === "Group" || obj.type === "Object3D"){
			obj.children.forEach(function(c){
				if(c.type === "Group" || c.type === "Object3D"){
					addDoubleSideMaterial(c);
				}else if(c.type === "Mesh"){
					c.material.side = THREE.DoubleSide;
					c.material.transparent = true;
					// c.material.opacity = 0.1;
				}
			});
		}else if(obj.type === "Mesh"){
			obj.material.side = THREE.DoubleSide;
			obj.material.transparent = true;
			// obj.material.opacity = 0.1;
		}
	}

	// loader model
	var modelCache = {}, currentModel = {path: '', model: null, mixers: [], extraModel: null};
	var manager = new THREE.LoadingManager();
	manager.onProgress = function(item, loaded, total){
		console.log(item, loaded, total);
	}
	var loader = new THREE.FBXLoader(manager), isloadingModel = false;
	function loadModel(path, id){
		// 控制模型载入
		_x.event.trigger('loading.start');
		isloadingModel = true;

		var currentConfig = config.filter(function(m, i){
			return m.id === id;
		}).pop();

		if(currentModel.path !== path){
			scene.remove(currentModel.model);
		}
		if(modelCache[path]){
			setCurrentModel({
				id: id,
				path: path,
				model: modelCache[path].model,
				mixers: modelCache[path].mixers,
				extraModel: currentConfig.extraModel
			});
			changeDesc();
			
			_x.event.trigger('loading.stop');
			isloadingModel = false;
		}else{
			document.getElementById('text').innerText = "";
			loader.load(path, function(object){
				addDoubleSideMaterial(object);
				console.log(object)

				var mixers = [];
				try{
					object.mixer = new THREE.AnimationMixer( object );
					if(object.mixer){
						object.mixer.timeScale = 3/4;
						mixers.push( object.mixer );

						var action = object.mixer.clipAction( object.animations[ 0 ] );
						action.play();
					}
				}catch(e){
					console.log('this model has no animations');
				}
				modelCache[path] = {model: object, mixers: mixers};

				setCurrentModel({
					id: id,
					path: path,
					model: object,
					mixers: mixers,
					extraModel: currentConfig.extraModel
				});
				changeDesc();

				_x.event.trigger('loading.stop');
				isloadingModel = false;
			}, function(xhr){
				if(xhr.lengthComputable){
					var percentComplete = xhr.loaded / xhr.total * 100;
					console.log(Math.round(percentComplete, 2) + '% downloaded');
					_x.event.trigger('loading.progress', Math.round(percentComplete, 2));
				}
			}, function(xhr){
				changeAnnotation(isAnnotationShow);
				console.error(xhr);
				_x.event.trigger('loading.stop');
				isloadingModel = false;
			});
		}
	}
	function setCurrentModel(model){
		scene.remove(currentModel.extraModel);

		currentModel.id = model.id;
		currentModel.path = model.path;
		currentModel.model = model.model;
		currentModel.mixers = model.mixers;
		currentModel.extraModel = model.extraModel;
		if(currentModel.extraModel){
			scene.add(currentModel.extraModel);
		}
		changeAnnotation(isAnnotationShow);
		cameraFocus(getComplexBoundingBox(currentModel.model));
		scene.add(currentModel.model);
	}

	// 模型标注功能
	// 创建标注
	function createTool(down){
		var cylinderHeight = 14, sphereRadius = 0.8;
		var cylinderGeo = new THREE.CylinderGeometry(0.2, 0.2, cylinderHeight, 20, 1);
		var cylinder = new THREE.Mesh(cylinderGeo, new THREE.MeshBasicMaterial({color: 0xd02323}));
		cylinder.name = 'pillar';
		
		var sphereGeo = new THREE.SphereGeometry(sphereRadius, 20, 20);
		var sphere = new THREE.Mesh(sphereGeo, new THREE.MeshPhongMaterial({color: 0xd02323}));
		sphere.name = 'base';

		var sphereGeo2 = new THREE.SphereGeometry(0.2, 20, 20);
		var sphere2 = new THREE.Mesh(sphereGeo2, new THREE.MeshBasicMaterial({color: 0x3da1ff}));
		sphere2.name = 'top';

		var sphereGeo3 = new THREE.SphereGeometry(0.4, 20, 20);
		var sphere3 = new THREE.Mesh(sphereGeo3, new THREE.MeshBasicMaterial({color: 0x3da1ff}));
		sphere3.name = 'checkpoint';

		var group = new THREE.Group();
		cylinder.position.z = cylinderHeight / 2;
		cylinder.rotation.x = Math.PI * 0.5;
		sphere3.position.z = sphere2.position.z = cylinderHeight;
		if(!down){
			sphere.position.z = cylinderHeight;
		}
		group.add(sphere2);
		group.add(sphere3);
		group.add(sphere);
		group.add(cylinder);
		group.translate(150, 150, 150);
		return group;
	}
	var annotations = [];
	function generateAnnotations(annoInfo, model){
		annoInfo = annoInfo || [];
		removeAnnotations();
		annoInfo.forEach(function(o){
			var divAnnotation = document.createElement('div');
			divAnnotation.classList.add('annotation');
			divAnnotation.innerText = o.text;
			document.body.appendChild(divAnnotation);

			var g = createTool(true);
			g.position.set( 0, 0, 0 );
			g.lookAt( o.lookAt );

			g.position.copy( o.position );
			annotations.push({obj: g, dom: divAnnotation});
			scene.add(g);
		});
	}
	function toScreenPosition(obj, camera) {
	    var vector = new THREE.Vector3();
	    // TODO: need to update this when resize window
	    // var widthHalf = 0.5*renderer.context.canvas.width;
	    // var heightHalf = 0.5*renderer.context.canvas.height;
	    var widthHalf = 0.5*document.body.clientWidth;
	    var heightHalf = 0.5*document.body.clientHeight;
	    
	    obj.updateMatrixWorld();
	    vector.setFromMatrixPosition(obj.matrixWorld);
	    vector.project(camera);
	    
	    vector.x = ( vector.x * widthHalf ) + widthHalf;
	    vector.y = - ( vector.y * heightHalf ) + heightHalf;
	    return { 
	        x: vector.x,
	        y: vector.y
	    };
	}
	function removeAnnotations(){
		annotations.forEach(function(o){
			scene.remove(o.obj);
			document.body.removeChild(o.dom);
		});
		annotations.length = 0;
	}

	// 渲染循环
	function render(){
		requestAnimationFrame(render);
		if (startAnimation && currentModel.mixers.length > 0 ) {
			for ( var i = 0; i < currentModel.mixers.length; i ++ ) {
				currentModel.mixers[ i ].update( clock.getDelta() );
			}
		}
		if(currentModel && currentModel.model){
			// 当相机移到模型左侧时，右侧标注透明显示，反之亦然
			if(currentModel.model.position.x < camera.position.x){
				annotations.forEach(function(o){
					if(o.obj.position.x > currentModel.model.position.x){
						o.obj.children.forEach(function(c){
							c.material.opacity = 1;
							c.material.transparent = false;
						});
				    	o.dom.style.opacity = 1;
					}else{
						o.obj.children.forEach(function(c){
							c.material.opacity = 0.2;
							c.material.transparent = true;
						});
				    	o.dom.style.opacity = 0.2;
					}
				});
			}else{
				annotations.forEach(function(o){
					if(o.obj.position.x < currentModel.model.position.x){
						o.obj.children.forEach(function(c){
							c.material.opacity = 1;
							c.material.transparent = false;
						});
				    	o.dom.style.opacity = 1;
					}else{
						o.obj.children.forEach(function(c){
							c.material.opacity = 0.2;
							c.material.transparent = true;
						});
				    	o.dom.style.opacity = 0.2;
					}
				});
			}
			// 更新标注的位置 
			annotations.forEach(function(o){
				var proj = toScreenPosition(o.obj.children[0], camera);
				var offsetLeft = 0;
				// 模型左侧的标注以dom元素右上角定位
				if(o.obj.position.x < currentModel.model.position.x){
					elementBorder = 1;
					offsetLeft = o.dom.clientWidth + elementBorder;
				}
		    	o.dom.style.left = (proj.x - offsetLeft) + 'px';
			    o.dom.style.top = proj.y + 'px';
			});
		}
		controls.update();
		renderer.render(scene, camera);
	}
	render();

	currentModel.path = config[0].path;
	currentModel.id = config[0].id;
	loadModel(currentModel.path, currentModel.id);

	return currentModel;
});