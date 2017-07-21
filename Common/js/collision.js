Declare_Any_Class("Collision_Manager",
{
	'construct': function() {
		this.bounding_volumes = {}; // {name, Bounding_Volume}
		this.colliding_volumes = {};

		this.collision_pairs = {};
	},
	'register_bounding_volume': function(name, aabb) {
		this.bounding_volumes[name] = aabb;
	},
	'unregister_bounding_volume': function(name) {
		if(this.bounding_volumes.hasOwnProperty(name)) 
			delete this.bounding_volumes[name];

		// if(this.colliding_volumes[name])
		// 	delete this.colliding_volumes[name];

		if(this.collision_pairs) {
			if(this.collision_pairs.hasOwnProperty(name))
				delete this.collision_pairs[name];
			else {
				var key;
				if(key = getKeyByValue(this.collision_pairs, name) !== null)
					delete this.collision_pairs[key];
			}
		}
	},
	'register_collision_pair': function(key1, key2) {
		if(this.bounding_volumes.hasOwnProperty(key1) || !this.bounding_volumes.hasOwnProperty(key2)) throw "Error: Cannot register volume - specified bounding volume undefined";

		this.collision_pairs.key1 = key2;
	},
	'unregister_collision_pair': function(key) {
		if(this.bounding_volumes.hasOwnProperty(key)) throw "Error: Cannot unregister volume - specified bounding volume undefined";

		delete this.collision_pairs[key];
	},
	'check_for_collisions': function() {
		this.colliding_volumes = {};

		var keys = Object.keys(this.collision_pairs);

		for(var i = 0; i < keys.length; i++) {
			if(this.check_if_colliding_aabb_aabb(this.bounding_volumes[keys[i]], this.bounding_volumes[this.collision_pairs[keys[i]]])) {
				this.colliding_volumes[keys[i]] = this.collision_pairs[keys[i]];
				this.colliding_volumes[this.collision_pairs[keys[i]]] = keys[i];
			}
		}
	},
	'check_if_colliding_aabb_aabb': function(a, b) {
		// if(this.bounding_volumes.hasOwnProperty(a) && this.bounding_volumes.hasOwnProperty(b)) {
			return (a.min_x <= b.max_x && a.max_x >= b.min_x) &&
	         (a.min_y <= b.max_y && a.max_y >= b.min_y) &&
	         (a.min_z <= b.max_z && a.max_z >= b.min_z);
		// }
	},
	'draw_bounding_volumes': function(g_state, shader) {
		var keys = Object.keys(this.bounding_volumes);

		for(var i = 0; i < keys.length; i++) {
			this.bounding_volumes[keys[i]].draw(g_state, shader);
		}
	}
});

Declare_Any_Class("AABB_Tester",
{
	'construct': function(context) {
		this.shared_scratchpad = context.shared_scratchpad;
		this.graphics_state = context.shared_scratchpad.graphics_state;
		this.shared_scratchpad.collision_mgr = new Collision_Manager();

		var shapes = [new Cube(), new Cube()];
		var model_transforms = [translation(1, 1, -1), translation(4, 2, -4)];
		// var model_transforms2 = [translation(-10, 3, -1), translation(-7, 2, -4)];
		var model_transforms2 = [translation(-1, 0, -1), translation(-7, 3, -7)]

		// this.aabb = new AABB(shapes, model_transforms, this.shared_scratchpad.collision_mgr, "aabb");
		// this.aabb2 = new AABB(shapes, model_transforms2, this.shared_scratchpad.collision_mgr, "aabb2");
		// this.shared_scratchpad.collision_mgr.bounding_volumes.aabb = this.aabb;
		// this.shared_scratchpad.collision_mgr.bounding_volumes.aabb2 = this.aabb2;
		// mgr.bounding_volumes.aabb2 = this.aabb2;
		// console.log("blah: " + this.shared_scratchpad.collision_mgr.check_if_colliding_aabb_aabb(this.aabb, this.aabb2));
		// console.log(this.aabb);
		// console.log(this.aabb2);

		// var vertices = [
		// 	vec3(this.aabb.min_x, this.aabb.min_y, this.aabb.min_z), // 0
		// 	vec3(this.aabb.min_x, this.aabb.min_y, this.aabb.max_z), // 1
		// 	vec3(this.aabb.min_x, this.aabb.max_y, this.aabb.min_z), // 2
		// 	vec3(this.aabb.min_x, this.aabb.max_y, this.aabb.max_z), // 3
		// 	vec3(this.aabb.max_x, this.aabb.min_y, this.aabb.min_z), // 4
		// 	vec3(this.aabb.max_x, this.aabb.min_y, this.aabb.max_z), // 5
		// 	vec3(this.aabb.max_x, this.aabb.max_y, this.aabb.min_z), // 6
		// 	vec3(this.aabb.max_x, this.aabb.max_y, this.aabb.max_z), // 7
		// ];

		// var vertices2 = [
		// 	vec3(this.aabb2.min_x, this.aabb2.min_y, this.aabb2.min_z), // 0
		// 	vec3(this.aabb2.min_x, this.aabb2.min_y, this.aabb2.max_z), // 1
		// 	vec3(this.aabb2.min_x, this.aabb2.max_y, this.aabb2.min_z), // 2
		// 	vec3(this.aabb2.min_x, this.aabb2.max_y, this.aabb2.max_z), // 3
		// 	vec3(this.aabb2.max_x, this.aabb2.min_y, this.aabb2.min_z), // 4
		// 	vec3(this.aabb2.max_x, this.aabb2.min_y, this.aabb2.max_z), // 5
		// 	vec3(this.aabb2.max_x, this.aabb2.max_y, this.aabb2.min_z), // 6
		// 	vec3(this.aabb2.max_x, this.aabb2.max_y, this.aabb2.max_z), // 7
		// ];

		// this.positions = [
		// 	vertices[2], vertices[3],
		// 	vertices[2], vertices[6], 
		// 	vertices[2], vertices[0],   

		// 	vertices[7], vertices[3], 
		// 	vertices[7], vertices[5], 
		// 	vertices[7], vertices[6],
			
		// 	vertices[1], vertices[0],
		// 	vertices[1], vertices[5], 
		// 	vertices[1], vertices[3], 

		// 	vertices[4], vertices[5], 
		// 	vertices[4], vertices[0], 
		// 	vertices[4], vertices[6]
		// ];

		// this.positions2 = [
		// 	vertices2[2], vertices2[3],
		// 	vertices2[2], vertices2[6], 
		// 	vertices2[2], vertices2[0],   

		// 	vertices2[7], vertices2[3], 
		// 	vertices2[7], vertices2[5], 
		// 	vertices2[7], vertices2[6],
			
		// 	vertices2[1], vertices2[0],
		// 	vertices2[1], vertices2[5], 
		// 	vertices2[1], vertices2[3], 

		// 	vertices2[4], vertices2[5], 
		// 	vertices2[4], vertices2[0], 
		// 	vertices2[4], vertices2[6]
		// ];

		// this.buffer = gl.createBuffer();

		// shapes_in_use.outline = new Outline(vertices, indices);
	},
	'display': function() {
		shaders_in_use[ "Simple_Shader" ].activate();
		// shapes_in_use.outline.draw();
		// var positions = [];
		// indices.push(3, 4, 3, 7, 3, 1,   8, 4, 8, 6, 8, 7,
		// 			   2, 1, 2, 6, 2, 4,   5, 6, 5, 1, 5, 7);

		// gl.drawArrays( gl.LINES, 0, 24);
		

		// var color = vec4(1.0, 1.0, 1.0, 1.0);
		// var vColor_loc = gl.getUniformLocation(shaders_in_use["Simple_Shader"].program, "vColor");
		// gl.uniform4fv(vColor_loc, flatten(color));

		// // for(var i = 0; i < )

  //       shaders_in_use["Simple_Shader"].update_uniforms( this.shared_scratchpad.graphics_state, mat4()); // do not use aaabb's transform, as the positions have already been transformed
  //       gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
  //       gl.bufferData( gl.ARRAY_BUFFER, flatten(this.aabb.positions), gl.STATIC_DRAW );

  //       // var oPosition = gl.getAttribLocation( shaders_in_use["Simple_Shader"].program, "vPosition" );
  //       var posAttrib = g_addrs.shader_attributes[0];
  //       gl.vertexAttribPointer( posAttrib.index, posAttrib.size, posAttrib.type, posAttrib.enabled, posAttrib.normalized, posAttrib.stride, posAttrib.pointer);
  //       gl.enableVertexAttribArray( posAttrib.index );
  //       gl.drawArrays( gl.LINES, 0, 24);

  //       // shaders_in_use["Simple_Shader"].update_uniforms( this.shared_scratchpad.graphics_state, mat4()); // transform does not need to change from identity matrix
  //       gl.bufferData( gl.ARRAY_BUFFER, flatten(this.aabb2.positions), gl.STATIC_DRAW );
  //       gl.drawArrays( gl.LINES, 0, 24);

  		// this.shared_scratchpad.collision_mgr.bounding_volumes.aabb.draw(this.graphics_state, shaders_in_use[ "Simple_Shader" ], Color(0, 1, 0, 1));
  		// this.shared_scratchpad.collision_mgr.bounding_volumes.aabb2.draw(this.graphics_state, shaders_in_use[ "Simple_Shader" ], Color(0, 1, 0, 1));

	}
}, Animation);

Declare_Any_Class("AABB",
{
	'construct': function(shapes, model_transforms, col_mgr, name, color = Color(1, 1, 1, 1)) {
		this.shapes = shapes;
		this.model_transforms = model_transforms;
		this.color = color;

		var pos = this.shapes[0].positions[0];
		var vertex = mult_vec(this.model_transforms[0], vec4(pos[0], pos[1], pos[2], 1));

		this.min_x = vertex[0];
		this.max_x = vertex[0];
		this.min_y = vertex[1];
		this.max_y = vertex[1];
		this.min_z = vertex[2];
		this.max_z = vertex[2];

		this.compute_bounds();
		this.calc_positions();
		col_mgr.register_bounding_volume(name, this);

		this.buffer = gl.createBuffer();
	},
	'compute_bounds': function(model_transforms) {
		if(model_transforms) this.model_transforms = model_transforms;

		if(this.shapes.length !== this.model_transforms.length) throw "Shapes and transforms must be of equal length";

		for(var i = 0; i < this.shapes.length; i++) {
			for(var j = 0; j < this.shapes[i].positions.length; j++) {
				var pos = this.shapes[i].positions[j];
				var vertex = this.model_transforms.length > 1 ? mult_vec(this.model_transforms[i], vec4(pos[0], pos[1], pos[2], 1)) : mult_vec(this.model_transforms[0], vec4(pos[0], pos[1], pos[2], 1));

				// if(vertex[0] < -8) {
				// 	console.log('i: ' + i + ", j: " +  j);
				// 	console.log('p: ' + pos[0]);
				// 	console.log('m: ' + this.model_transforms[i][0][3]);
				// 	console.log('v: ' + vertex[0]);
				// }

				// if(vertex[1] < 1) console.log('v y: ' + vertex[1]);

				if(vertex[0] < this.min_x)
					this.min_x = vertex[0];
				else if(vertex[0] > this.max_x)
					this.max_x = vertex[0];

				if(vertex[1] < this.min_y)
					this.min_y = vertex[1];
				else if(vertex[1] > this.max_y)
					this.max_y = vertex[1];

				if(vertex[2] < this.min_z)
					this.min_z = vertex[2];
				else if(vertex[2] > this.max_z)
					this.max_z = vertex[2];
			}
		}

		this.size = vec3(this.max_x - this.min_x, this.max_y - this.min_y, this.max_z - this.min_z);
		this.center = vec3((this.min_x + this.max_x)/2, (this.min_y + this.max_y)/2, (this.min_z + this.max_z)/2);
		this.transform = mult(translation(this.center[0], this.center[1], this.center[2]), scale(this.size[0], this.size[1], this.size[2]));
	},
	'calc_positions': function() {
		var vertices = [
			vec3(this.min_x, this.min_y, this.min_z), // 0
			vec3(this.min_x, this.min_y, this.max_z), // 1
			vec3(this.min_x, this.max_y, this.min_z), // 2
			vec3(this.min_x, this.max_y, this.max_z), // 3
			vec3(this.max_x, this.min_y, this.min_z), // 4
			vec3(this.max_x, this.min_y, this.max_z), // 5
			vec3(this.max_x, this.max_y, this.min_z), // 6
			vec3(this.max_x, this.max_y, this.max_z), // 7
		];

		this.positions = [
			vertices[2], vertices[3],
			vertices[2], vertices[6], 
			vertices[2], vertices[0],   

			vertices[7], vertices[3], 
			vertices[7], vertices[5], 
			vertices[7], vertices[6],
			
			vertices[1], vertices[0],
			vertices[1], vertices[5], 
			vertices[1], vertices[3], 

			vertices[4], vertices[5], 
			vertices[4], vertices[0], 
			vertices[4], vertices[6]
		];
	},
	'draw': function(g_state, shader, color) {
		// var color = vec4(1.0, 1.0, 1.0, 1.0);
		var vColor_loc = gl.getUniformLocation(shader.program, "vColor");
		gl.uniform4fv(vColor_loc, flatten(color ? color : this.color));
		
		shader.update_uniforms( g_state, mat4());
        gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(this.positions), gl.STATIC_DRAW );
		
		var posAttrib = g_addrs.shader_attributes[0];
        gl.vertexAttribPointer( posAttrib.index, posAttrib.size, posAttrib.type, posAttrib.enabled, posAttrib.normalized, posAttrib.stride, posAttrib.pointer);
        gl.enableVertexAttribArray( posAttrib.index );
        gl.drawArrays( gl.LINES, 0, 24);
	}
});

function getKeyByValue(obj, value) {
	var keys = Object.keys(obj);

	for(var i = 0; i < keys.length; i++) {
		if(obj[keys[i]] === value) {
			return keys[i];
		}
	}

	return null;
}