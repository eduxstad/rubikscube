/**
 ** @author Ligang Wang, http://github.com/ligangwang/
 **/
var Facet = function(cubie, color){
	this.cubie = cubie;
	this.color = color;
}

Facet.prototype = {
	construct : function(bottom_left, axis){
		var vertices = [];
		var point0 = bottom_left.clone();
		var point1 = point0.clone().applyAxisAngle(axis, Math.PI/2);
		var point2 = point1.clone().applyAxisAngle(axis, Math.PI/2);
		var point3 = point2.clone().applyAxisAngle(axis, Math.PI/2);
		vertices.push(point0);
		vertices.push(point1);
		vertices.push(point2);
		vertices.push(point3);
		
		this.geometry = new THREE.Geometry();
		this.geometry.vertices = vertices;
		this.geometry.faces.push(new THREE.Face3(0, 1, 2));
		this.geometry.faces.push(new THREE.Face3(2, 3, 0));
		this.meshes = [this.createSquareMesh(), this.createEdgeMesh()];
	},

	createSquareMesh : function(){
		var material = new THREE.MeshBasicMaterial( { color: this.color, side:THREE.DoubleSide, opacity: 0.9, transparent: true } );
		return new THREE.Mesh( this.geometry, material );
	},
	
	createEdgeMesh : function(){
		var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 1, linewidth: 4 } );
		return new THREE.Line(this.geometry, material);
	},
	
	setPosition : function(){
		var m = new THREE.Matrix4();
		return function(position){
			m.makeTranslation(position.x, position.y, position.z);
			this.geometry.applyMatrix(m);
		}
	}(),
	
	applyMatrix: function(matrix){	
		this.geometry.applyMatrix(matrix);
	},
	
	clone: function(){
		var facet = new Facet(this.cubie, this.color);
		facet.geometry = this.geometry.clone();
		facet.meshes = [facet.createSquareMesh(), facet.createEdgeMesh()]
		return facet;
	},
	
	addToScene : function(scene){
		for (var mesh of this.meshes){
			scene.add(mesh);
		}
	},
	
	removeFromScene : function(scene){
		for (var mesh of this.meshes){
			scene.remove(mesh);
		}
	},
}

var Cubie = function(name, position, cubeRotation){
	var facets = [];
	for (var face_name of cubeRotation.face_names){
		if(name.indexOf(face_name) > -1){
			var facet = new Facet(this, cubeRotation.facet_configs[face_name][0]);
			facet.construct(cubeRotation.facet_configs[face_name][1], cubeRotation.face_rotations[face_name][0]);
			facets[face_name] = facet;
		}
	}
	this.facets = facets;
	this.cubeRotation = cubeRotation;
	this.name = name;
	this.orientation = name;
	this.setPosition(position);
}

Cubie.prototype = {
	setPosition : function(position){
		this.position = position;
		for (var key in this.facets){
			var facet = this.facets[key];
			facet.setPosition(position);
		}
	},

	applyMatrix: function(matrix){	
		for (var key in this.facets){
			var facet = this.facets[key];
			facet.applyMatrix(matrix);
		}
	},
	
	rotateOrientation : function(op){
		var orientation = this._rotateOrientation(this.orientation, op);
		var from_facets = this.facets;
		this.facets = [];
		for (var i = 0, len = this.orientation.length; i < len; i++){
			var from_facet = this.orientation[i];
			var to_facet = orientation[i];
			this.facets[to_facet] = from_facets[from_facet];
		}
		this.orientation = orientation;
	},
	
	_rotateOrientation : function(orientation, op){
		var rotation_cycle = this.cubeRotation.face_rotation_cycle[op];
		var rotation_cycle_len = rotation_cycle.length;
		var to_orientation = "";
		for (var i = 0, len=orientation.length; i < len; i++){
			var from_face = orientation[i];
			var pos = rotation_cycle.indexOf(from_face)
			if (pos > -1){
				var to_face = rotation_cycle[(pos+1)%rotation_cycle_len];
				to_orientation += to_face;
			}else{
				to_orientation += from_face;
			}
		}
		return to_orientation;
	},
	
}

var RubiksCube = function(){
	this.position = new THREE.Vector3(0,0,0);
	this.cubies = [];
	this.cubeRotation = new CubeRotation(); 

	// this.cubies.push(new Cubie("DRF", new THREE.Vector3(200,-200,200), this.cubeRotation)); //R: FRU->DRF	
	// this.cubies.push(new Cubie("DBR", new THREE.Vector3(200,-200,-200), this.cubeRotation)); //B: RBU->DBR
	// this.cubies.push(new Cubie("FLD", new THREE.Vector3(-200,-200,200), this.cubeRotation)); //F: FUL->FLD

	this._addCubie(new Cubie("FRU", new THREE.Vector3(200,200,200), this.cubeRotation));
	this._addCubie(new Cubie("FUL", new THREE.Vector3(-200,200,200), this.cubeRotation)); //F: FRU->FUL
	this._addCubie(new Cubie("RBU", new THREE.Vector3(200,200,-200), this.cubeRotation)); //U: FRU->RBU
	this._addCubie(new Cubie("DRF", new THREE.Vector3(200,-200,200), this.cubeRotation)); //R: FRU->DRF	
	this._addCubie(new Cubie("FLD", new THREE.Vector3(-200,-200,200), this.cubeRotation)); //F: FUL->FLD
	this._addCubie(new Cubie("UBL", new THREE.Vector3(-200,200,-200), this.cubeRotation)); //L: FUL->UBL
	this._addCubie(new Cubie("DBR", new THREE.Vector3(200,-200,-200), this.cubeRotation)); //B: RBU->DBR
	this._addCubie(new Cubie("DLB", new THREE.Vector3(-200,-200,-200), this.cubeRotation));//D: FLD->LBD
	
	this._addCubie(new Cubie("FU", new THREE.Vector3(0,200,200), this.cubeRotation));
	this._addCubie(new Cubie("RU", new THREE.Vector3(200,200,0), this.cubeRotation));
	this._addCubie(new Cubie("BU", new THREE.Vector3(0,200,-200), this.cubeRotation));
	this._addCubie(new Cubie("LU", new THREE.Vector3(-200,200,0), this.cubeRotation));
	
	this._addCubie(new Cubie("FR", new THREE.Vector3(200,0,200), this.cubeRotation));
	this._addCubie(new Cubie("RB", new THREE.Vector3(200,0,-200), this.cubeRotation));
	this._addCubie(new Cubie("BL", new THREE.Vector3(-200,0,-200), this.cubeRotation));
	this._addCubie(new Cubie("LF", new THREE.Vector3(-200,0,200), this.cubeRotation));
	this._addCubie(new Cubie("FD", new THREE.Vector3(0,-200,200), this.cubeRotation));
	this._addCubie(new Cubie("RD", new THREE.Vector3(200,-200,0), this.cubeRotation));
	this._addCubie(new Cubie("BD", new THREE.Vector3(0,-200,-200), this.cubeRotation));
	this._addCubie(new Cubie("LD", new THREE.Vector3(-200,-200,0), this.cubeRotation));
	
	this._addCubie(new Cubie("F", new THREE.Vector3(0,0,200), this.cubeRotation));
	this._addCubie(new Cubie("D", new THREE.Vector3(0,-200,0), this.cubeRotation));
	this._addCubie(new Cubie("B", new THREE.Vector3(0,0,-200), this.cubeRotation));
	this._addCubie(new Cubie("R", new THREE.Vector3(200,0,0), this.cubeRotation));
	this._addCubie(new Cubie("L", new THREE.Vector3(-200,0,0), this.cubeRotation));
	this._addCubie(new Cubie("U",  new THREE.Vector3(0,200,0), this.cubeRotation));

	this.cubie_list = [];
	for (var key in this.cubies){
		this.cubie_list.push(this.cubies[key]);
	}
	this.is_in_animation = false;
	this.commands = "";
	this.enable_animation = true;
	this.time_per_animation_move = 800; //in millisecond
	this.is_folded = true;
}

RubiksCube.prototype = {
	_addCubie : function(cubie){
		orientation = sort(cubie.name);
		this.cubies[orientation] = cubie;	
	},
	
	addToScene : function(scene){
		this.scene = scene;
		for (var cubie_key in this.cubies){
			var cubie = this.cubies[cubie_key];
			for (var key in cubie.facets){
				var facet = cubie.facets[key];
				facet.addToScene(scene);
			}
		}
	},
	
	test : function(){
		//this.time_per_animation_move = 20000;
		//translation.makeScale(1, 1, this.test_scales[this.test_index]);
		//console.log(facet);
		//facet.applyMatrix(translation);
		var teleporters = [
			new Teleporter(this.scene, this.cubies["DFR"].facets["R"], 900, new THREE.Vector3(900, 0, 0), new THREE.Vector3(500, 0, -200 * 8), -100,  AxisX, 1, -1),
			new Teleporter(this.scene, this.cubies["FR"].facets["R"], 700, new THREE.Vector3(900, 0, 0), new THREE.Vector3(500, 0, -200 * 8), 100,  AxisX, 1, -1),
			new Teleporter(this.scene, this.cubies["FRU"].facets["R"], 500, new THREE.Vector3(900, 0, 0), new THREE.Vector3(500, 0, -200 * 8), 300,  AxisX, 1, -1),
			new Teleporter(this.scene, this.cubies["DFL"].facets["D"], -300, new THREE.Vector3(-300, 0, -200 * 8), new THREE.Vector3(-1100, 0, 0), -500,  AxisX, -1, 1),
			new Teleporter(this.scene, this.cubies["DF"].facets["D"], -100, new THREE.Vector3(-300, 0, -200 * 8), new THREE.Vector3(-1100, 0, 0), -700,  AxisX, -1, 1),
			new Teleporter(this.scene, this.cubies["DFR"].facets["D"], 100, new THREE.Vector3(-300, 0, -200 * 8), new THREE.Vector3(-1100, 0, 0), -900,  AxisX, -1, 1),
		]; 
		
		this._withAnimation(
			function(args, total, delta){ 
				for (var teleporter of teleporters){
					teleporter.transform(total, delta);
				}
				console.log(total);
			}, 
			{cube: this},
			function(args){ 
			}
		);
		//this.time_per_animation_move = saved;
	},
	
	rotate : function(op){
		if (this.is_in_animation){
			console.log("the cube is rotating. quiting ".concat(op))
			return;
		}
		// if (!this.is_folded){
		// 	console.log("the cube is unfolded. quiting ".concat(op))
		// 	return;
		// }
		var op_face_name = op.slice(0, 1);
		is_reverse_op = op.slice(1)=="'";
		var rotate_cubies = [];
		for (var cubie_key in this.cubies){
			var cubie = this.cubies[cubie_key];
			if (op_face_name in cubie.facets){
				rotate_cubies = rotate_cubies.concat(cubie);
			}
		}
		var  transformers = [];
		if (this.is_folded){
			var rotate_axis = this.cubeRotation.face_rotations[op_face_name][0];
			var rotate_angle = this.cubeRotation.face_rotations[op_face_name][1];
			transformers.push(new Rotater(rotate_cubies, this.cubeRotation.Origin, rotate_axis, is_reverse_op? -rotate_angle:rotate_angle));
		}else{//rotating on unfolded plain
			for(var rotate_group of this.cubeRotation.facet_fold_translations[op_face_name]){
				var facets = this._getFacets(rotate_cubies, rotate_group.facets);
				if (rotate_group.translation != undefined){
					translation = rotate_group.translation
					if (is_reverse_op){
						translation = translation.clone().negate();
					}
					transformers.push(new Translater(facets, translation));
				}else{
					transformers.push(new Rotater(facets, rotate_group.origin, this.cubeRotation.AxisY, is_reverse_op? -rotate_group.angle:rotate_group.angle));
				}
			}
		}
		
		this._withAnimation(
			function(args, total, delta){ 
				for (var transformer of transformers){
					transformer.transform(total, delta);
				}
			}, 
			{cube:this},
			function(args){ 
				for(var cubie of rotate_cubies){
					cubie.rotateOrientation(op);
				}
			}
		);
	},

	_withAnimation: function(action, args, onComplete){
		if (this.enable_animation){
			this.is_in_animation = true;
			var tween = new TWEEN.Tween({value:0.0}).to({value: 1.0}, this.time_per_animation_move);
			var last_data = 0.0;
			tween.onUpdate(function(){
				var delta = this.value - last_data;
				last_data = this.value;
				action(args, this.value, delta);
			});
			tween.onComplete(function(){
				args.cube.is_in_animation = false;
				onComplete(args);
				args.cube._doNextCommand();
			});
			tween.start();
		}else{
			action(args, 1);
			onComplete(args);
			args.cube._doNextCommand();
		}
	},
 
 	_getFacets : function(cubies, facet_names){
		var facets = []
		for(var cubie of cubies){
			for (var key in cubie.facets){
				if (facet_names.indexOf(key) > -1){ 
					var facet = cubie.facets[key];
					facets.push(facet);
				}
			}
		}
		return facets;
	},
	
	_fold: function(do_unfolding, delta){
		for (var orientation in this.cubeRotation.facet_fold_config){
			var facets = this._getFacets(this.cubie_list, orientation);
			var transforms = this.cubeRotation.facet_fold_config[orientation];
			var m = undefined;
			for (var transform of transforms){
				var translate = transform[0];
				if (m != undefined){
					translate.applyMatrix4(m);
				}
				var rotate_axis = transform[1];
				var rotate_angle = transform[2] * delta;
				m = Transform(translate, rotate_axis, do_unfolding? rotate_angle:-rotate_angle);
				for (var facet of facets){
					facet.geometry.applyMatrix(m);
				} 
			}
		}
	},
	
	fold : function(){
		this._withAnimation(
			function(args, total, delta){ 
				args.cube._fold(args.cube.is_folded, delta);
			}, 
			{cube:this},
			function(args){ args.cube.is_folded  = !args.cube.is_folded;}
		);
	},

	isValidInputChar:function(prev_char, char){
		if ("OST".indexOf(char) > -1){
			return true;
		}
		return (char in this.cubeRotation.face_rotations) || ("OST'".indexOf(prev_char) < 0 && char == "'");
	},

	command : function(command){
		this.commands = this.commands.concat(command);	
		if (!this.is_in_animation){
			this._doNextCommand();
		}
	},
	
	
	_doNextCommand : function(){
		var op = this._getNextOp();
		if (op != ""){
			if (op == "S"){
				this.randomize();
			}
			else if(op == "O"){
				this.fold();
			}
			else if(op == "T"){
				this.test();
			}
			else{this.rotate(op);}
		}	
	},
	
	_getNextOp : function(){
		var len = this.commands.length;
		var look_at = 0;
		if (len > 1){
			if (this.commands[1] == "'"){
				look_at = 2;
			}else{
				look_at = 1;
			}
		}else if(len == 1){
			look_at = 1;
		}
		var op = this.commands.slice(0, look_at);
		this.commands = this.commands.slice(look_at);
		console.log(op, this.commands);
		return op;
	},
	
	randomize : function(){
		var saved = this.enable_animation;
		this.enable_animation = false;
		for (var i = 0; i < 20; i++){
			var op_i = this._getRandom(0, this.cubeRotation.operations.length - 1);
			var op = this.cubeRotation.operations[op_i]
			this.rotate(op);
		}
		this.enable_animation = saved; 	
	},
	
	_getRandom:function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}	
}
