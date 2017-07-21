Declare_Any_Class("Character_Scene_Graph",
{
	'construct': function(context) {
		this.shared_scratchpad = context.shared_scratchpad;
		this.graphics_state = context.shared_scratchpad.graphics_state;
		// this.degree = 0;
		this.degreeDelta = 0;

		this.movementDegree = 0;
		this.movementDir = 0;
		this.lastDir = 0;

		// console.log(this.graphics_state);

		shapes_in_use.cube = new Cube();
		shapes_in_use.sphere = new Sphere(10, 10);
		shapes_in_use.circle = new Circle(30);
		shapes_in_use.triangle = new Triangle();

		this.materials = {
			brightRed: new Material( Color(240/255, 81/255, 54/255, 1), .8, .8, .4, 40),
            icyGrey: new Material( Color(187/255, 188/255, 188/255, 1), .4, .8, .4, 40),
            blueGreen: new Material( Color(64/255, 193/255, 172/255, 1), .4, .4, .2, 40),
            lightBlue: new Material( Color(116/255, 209/255, 234/255, 1), .4, .4, .2, 40),
            brownOrange: new Material( Color(189/255, 100/255, 57/255), .6, .6, .2, 40),
            yellow: new Material( Color(255/255, 236/255, 45/255, 1), .4, .4, .2, 40)
        };

        this.nodeInfosByName = {};
        this.objects = [];
        this.generateNodeDesc();
        // this.scene = this.makeNode(this.charNodeDescs);
        this.scene = makeNode(this.charNodeDescs);
        // console.log(this.scene);
	},
	'generateNodeDesc': function() {
		this.charNodeDescs = {
			name: "char",
			draw: false,
			children: [
				{
					name: "torso",
					translation: [7, 1.75, -45],
					scale: [1.25, 1.5, 1],
					shape: shapes_in_use.cube,
					material: this.materials.icyGrey,
					children: [
						{
							name: "head",
							translation: [0, 3, 0],
							scale: [2.5, 1.5, 1.5],
							adoptParentScale: false,
							shape: shapes_in_use.cube,
							material: this.materials.blueGreen,
							children: [
								{
									name: "right-eye",
									translation: [-0.85, 0.3, 1.51],
									scale: [0.25, 0.25, 0.25],
									adoptParentScale: false,
									shape: shapes_in_use.circle,
									material: this.materials.yellow
								},
								{
									name: "left-eye",
									translation: [0.85, 0.3, 1.51],
									scale: [0.25, 0.25, 0.25],
									adoptParentScale: false,
									shape: shapes_in_use.circle,
									material: this.materials.yellow
								},
								{
									name: "mouth",
									translation: [0, -0.25, 1.51],
									rotation: [0, 0, -135],
									scale: [0.5, 0.5, 0.5],
									adoptParentScale: false,
									shape: shapes_in_use.triangle,
									material: this.materials.yellow
								}
							]
						},
						{
							name: "right-arm-joint",
							translation: [-1.75, 0.825, 0],
							scale: [0.5, 0.5, 0.5],
							adoptParentScale: false,
							shape: shapes_in_use.sphere,
							material: this.materials.lightBlue,
							children: [
								{
									name: "right-arm",
									translation: [0, -2, 0],
									scale: [0.5, 1.5, 0.5],
									adoptParentScale: false,
									shape: shapes_in_use.cube,
									material: this.materials.lightBlue
								}
							]
						},
						{
							name: "left-arm-joint",
							translation: [1.75, 0.825, 0],
							scale: [0.5, 0.5, 0.5],
							adoptParentScale: false,
							shape: shapes_in_use.sphere,
							material: this.materials.lightBlue,
							children: [
								{
									name: "left-arm",
									translation: [0, -2, 0],
									scale: [0.5, 1.5, 0.5],
									adoptParentScale: false,
									shape: shapes_in_use.cube,
									material: this.materials.lightBlue
								}
							]
						},
						{
							name: "right-leg-joint",
							translation: [-0.675, -2, 0],
							scale: [0.5, 0.5, 0.5],
							adoptParentScale: false,
							shape: shapes_in_use.sphere,
							material: this.materials.lightBlue,
							children: [
								{
									name: "right-leg",
									translation: [0, -1.5, 0],
									scale: [0.5, 1, 0.5],
									adoptParentScale: false,
									shape: shapes_in_use.cube,
									material: this.materials.lightBlue
								}
							]
						},
						{
							name: "left-leg-joint",
							translation: [0.675, -2, 0],
							scale: [0.5, 0.5, 0.5],
							adoptParentScale: false,
							shape: shapes_in_use.sphere,
							material: this.materials.lightBlue,
							children: [
								{
									name: "left-leg",
									translation: [0, -1.5, 0],
									scale: [0.5, 1, 0.5],
									adoptParentScale: false,
									shape: shapes_in_use.cube,
									material: this.materials.lightBlue
								}
							]
						}
					]
				}
			]
		};
	},
	// 'makeNode': function(nodeDesc) {
	// 	// console.log(nodeDesc);
	// 	var trs  = new TRS();
	//     var node = new Node(trs);
	//     node.shape = nodeDesc.shape;
	//     node.material = nodeDesc.material;

	//     this.nodeInfosByName[nodeDesc.name] = {
	// 		trs: trs,
	// 		node: node,
	//     };
	//     trs.translation = nodeDesc.translation || trs.translation;
	//     if (nodeDesc.draw !== false) {
	// 		// node.drawInfo = {
	// 		// 	// material go here
				

	// 		// 	// uniforms: {
	// 		// 	//   u_colorOffset: [0, 0, 0.6, 0],
	// 		// 	//   u_colorMult: [0.4, 0.4, 0.4, 1],
	// 		// 	// },
	// 		// 	// programInfo: programInfo,
	// 		// 	// bufferInfo: cubeBufferInfo,
	// 		// };
	// 		// this.objectsToDraw.push(node.drawInfo);
	// 		this.objects.push(node);
	//     }
	//     console.log(nodeDesc);
	//     this.makeNodes(nodeDesc.children).forEach(function(child) {
	//     	console.log("child: " + child);
	//       child.setParent(node);
	//     });
	//     return node;
	// },
	// 'makeNodes': function(nodeDescs) {
	// 	return nodeDescs ? nodeDescs.map(function(x) { this.makeNode(x); }, this) : [];
	// },
	'init_keys': function(controls) {
		controls.add("j", this, function() { this.movementDir = -1; });
		controls.add("k", this, function() { this.movementDir = 0; });
		controls.add("l", this, function() { this.movementDir = 1; });
	},
	'display': function(time) {
		var model_transform = mat4();
		shaders_in_use[ "Default" ].activate();

		// this.graphics_state.lights = [new Light( vec4( 5, 0, 5, 1 ), Color( 0, 1, 0, 1 ), 100000000 )];

// console.log("scene: " + this.scene);
		// this.scene.updateWorldMatrix();


		
		if(this.movementDir !== 0) {
		    var adjust = Math.sin(this.graphics_state.animation_time/300) * 45;
		    nodeInfosByName["right-arm-joint"].trs.rotation[0] = -adjust;
		    nodeInfosByName["left-arm-joint"].trs.rotation[0] = adjust;
		    nodeInfosByName["right-leg-joint"].trs.rotation[0] = adjust;
		    nodeInfosByName["left-leg-joint"].trs.rotation[0] = -adjust;
		} else {
			nodeInfosByName["right-arm-joint"].trs.rotation[0] = 0;
			nodeInfosByName["left-arm-joint"].trs.rotation[0] = 0;
			nodeInfosByName["right-leg-joint"].trs.rotation[0] = 0;
			nodeInfosByName["left-leg-joint"].trs.rotation[0] = 0;
		}

		this.shared_scratchpad.char_arm_transform = nodeInfosByName["right-arm"].node.worldMatrix;

	    // console.log(nodeInfosByName["right-arm"].node.worldMatrix);
		// nodeInfosByName["right-arm"].node.worldMatrix = mult(nodeInfosByName["right-arm"].node.worldMatrix, rotation(45, [1, 0, 0]));

		this.lastDir = this.movementDir !== 0 ? this.movementDir : this.lastDir;
		this.movementDegree += this.movementDir * -0.4;
		model_transform = mult(this.shared_scratchpad.camera_origin, rotation(this.movementDegree, [0, 1, 0]));
		model_transform = mult(model_transform, translation(0, -1.25, -30));
		// if(this.shared_scratchpad.animate)
		model_transform = mult(model_transform, rotation(this.movementDir !== 0 ? (this.movementDir * 65) : this.lastDir * 65, [0, 1, 0]));

		var theta;
		// if(this.degreeDelta % 180 < 1)
			theta = ((degrees(-Math.asin(model_transform[2][0])))); // degrees(Math.atan2(-model_transform[2][0], Math.sqrt(Math.pow(model_transform[2][1], 2) + Math.pow(model_transform[2][2], 2))));
		// else
		// 	theta = (degrees(Math.PI + Math.asin(model_transform[2][0])) + 360) % 360;
		// this.degreeDelta = (this.degreeDelta + Math.abs(theta - (this.degree || theta))) %360;
		// this.degree = theta;
		// console.log("delta: " + this.degreeDelta);

		// var phi = Math.atan2(model_transform[1][0]/Math.cos(theta), model_transform[0][0]/Math.cos(theta));
		// var psi = Math.atan2(model_transform[2][1]/Math.cos(theta), model_transform[2][2]/Math.cos(theta));


		// nodeInfosByName["torso"].trs.translation[0] = model_transform[0][3]; //model_transform[0][3]; //model_transform[0][3] * Math.cos(theta) + model_transform[2][3] * Math.sin(theta);
		// nodeInfosByName["torso"].trs.translation[1] = model_transform[1][3];
		// nodeInfosByName["torso"].trs.translation[2] = model_transform[2][3]; //model_transform[2][3] * Math.cos(theta) - model_transform[0][3] * Math.sin(theta);
		// nodeInfosByName["torso"].trs.rotation[1] = theta;
		// nodeInfosByName["torso"].trs.rotation[0] = phi;
		// nodeInfosByName["torso"].trs.rotation[2] = psi;

		// console.log(model_transform[0][3] + ', ' + model_transform[1][3] + ', ' + model_transform[2][3]);
		// console.log('mt');
		// console.log((model_transform));

		// nodeInfosByName["torso"].node.localMatrix = model_transform;
		// console.log(nodeInfosByName["torso"].node.worldMatrix);

		// ******** needed to rotate around camera **********
		nodeInfosByName["torso"].node.updateWorldMatrix(null, model_transform);

		// console.log('y rotate:');
		// console.log(theta);

		// get rotation vector
		// var vLengths = [];
		// for(var i = 0; i < 3; i++) {
		// 	var squaredSum = 0;

		// 	for(var j = 0; j < 3; j++) {
		// 		squaredSum += model_transform[i][j] * model_transform[i][j];
		// 	}

		// 	vLengths.push(Math.sqrt(squaredSum));
		// }


		var shapes = [];
		var transforms = [];

		for(var i = 0; i < objects.length; i++) {
			// console.log(objects[i].worldMatrix);
			// model_transform = mult(objects[i].worldMatrix, rotation(graphics_state.animation_time/300 * 5, [0, 1, 0]));
			shapes.push(objects[i].shape);
			transforms.push(objects[i].worldMatrix);
			objects[i].shape.draw(this.graphics_state, objects[i].worldMatrix, objects[i].material);
		}

		// shaders_in_use[ "Simple_Shader" ].activate();

		// if(!this.shared_scratchpad.collision_mgr.bounding_volumes.char)
			new AABB(shapes, transforms, this.shared_scratchpad.collision_mgr, "char");
		// this.shared_scratchpad.collision_mgr.bounding_volumes.char.draw(this.graphics_state, shaders_in_use[ "Simple_Shader" ], Color(0.5, 0, 0.5, 1));

		// if(this.shared_scratchpad.collision_mgr.bounding_volumes.tag)
		// 	console.log('char + tag: ' + this.shared_scratchpad.collision_mgr.check_if_colliding_aabb_aabb(this.shared_scratchpad.collision_mgr.bounding_volumes.char, this.shared_scratchpad.collision_mgr.bounding_volumes.tag));

		if(this.shared_scratchpad.collision_mgr.check_if_colliding_aabb_aabb(this.shared_scratchpad.collision_mgr.bounding_volumes.char, this.shared_scratchpad.collision_mgr.bounding_volumes.picker)) {
			this.movementDir = 0;
		} else {
			if(this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[0] < 0
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[2] < 0 
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.char.center[0] > this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[0]
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.char.center[2] < this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[2]) {
				this.movementDir = -1;
			} else if(this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[0] < 0
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[2] < 0 
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.char.center[0] < this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[0]
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.char.center[2] > this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[2]) {
				this.movementDir = 1;
			} else if(this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[0] > 0
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[2] < 0 
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.char.center[0] > this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[0]
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.char.center[2] > this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[2]) {
				this.movementDir = -1;
			} else if(this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[0] > 0
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[2] < 0 
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.char.center[0] < this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[0]
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.char.center[2] < this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[2]) {
				this.movementDir = 1;
			} else if(this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[0] < 0
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[2] > 0 
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.char.center[0] < this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[0]
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.char.center[2] < this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[2]) {
				this.movementDir = -1;
			} else if(this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[0] < 0
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[2] > 0 
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.char.center[0] > this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[0]
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.char.center[2] > this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[2]) {
				this.movementDir = 1;
			} else if(this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[0] > 0
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[2] > 0 
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.char.center[0] < this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[0]
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.char.center[2] > this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[2]) {
				this.movementDir = -1;
			} else if(this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[0] > 0
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[2] > 0 
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.char.center[0] > this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[0]
				&& this.shared_scratchpad.collision_mgr.bounding_volumes.char.center[2] < this.shared_scratchpad.collision_mgr.bounding_volumes.picker.center[2]) {
				this.movementDir = 1;
			} 
		}
	}, 
}, Animation);

var nodeInfosByName = {};
var objects = [];

function makeNode(nodeDescription) {
    var trs  = new TRS();
    var node = new Node(trs);
    nodeInfosByName[nodeDescription.name] = {
      trs: trs,
      node: node,
    }; 
    trs.translation = nodeDescription.translation || trs.translation;
    trs.rotation = nodeDescription.rotation || trs.rotation;
    trs.scale = nodeDescription.scale || trs.scale;
    // console.log('node trans'); console.log(node.source.translation);
    if (nodeDescription.draw !== false) {
      // node.drawInfo = {
      //   uniforms: {
      //     u_colorOffset: [0, 0, 0.6, 0],
      //     u_colorMult: [0.4, 0.4, 0.4, 1],
      //   },
      //   programInfo: programInfo,
      //   bufferInfo: cubeBufferInfo,
      // };
      // objectsToDraw.push(node.drawInfo);
      node.shape = nodeDescription.shape;
      node.material = nodeDescription.material;
      objects.push(node);
    } //console.log(nodeDescription);
    // console.log('obj len: ' + objects.length);
    makeNodes(nodeDescription.children).forEach(function(child) {
      child.setParent(node);
    });
    return node;
  }

  function makeNodes(nodeDescriptions) {
    return nodeDescriptions ? nodeDescriptions.map(makeNode) : [];
  }