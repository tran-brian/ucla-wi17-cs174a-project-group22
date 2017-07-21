Declare_Any_Class("Cap", 
{
	'construct': function(context) {
		this.shared_scratchpad = context.shared_scratchpad;
		// this.graphics_state = context.shared_scratchpad.graphics_state;

		// shapes_in_use.cube = new Cube();
		shapes_in_use.tube = new Cylindrical_Tube(30, 30);
		// shapes_in_use.circle = new Regular_2D_Polygon(15, 15);

		textures_in_use.friedman = new Texture("Common/textures/friedman-before-snap.jpg", false)
		textures_in_use.friedman2 = new Texture("Common/textures/friedman-snap.jpg", false);
		this.shared_scratchpad.cap_tex = "friedman";


		
	},
	'display': function(time) {
		this.materials = {
			bruinBlue: new Material( Color(74/255, 173/255, 223/255, 1), .2, .6, .8, 40),
			friedman: new Material( Color(255/255, 255/255, 255/255, 1), 0.3, 0.2, .2, 40, this.shared_scratchpad.cap_tex)
		};

		var model_transform = mat4();
		shaders_in_use[ "Default" ].activate();

		model_transform = mult(model_transform, translation(0, 6.75, 0));
		model_transform = mult(model_transform, rotation(90, 1, 0, 0));

		shapes_in_use.tube.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.bruinBlue);

		// model_transform = mat4();
		// model_transform = mult(model_transform, translation(5, 0.6, 0));
		model_transform = mult(model_transform, rotation(-90, 1, 0, 0));
		model_transform = mult(model_transform, translation(0, 0.6, 0))
		var top_trans = model_transform;
		model_transform = mult(model_transform, scale(2, 0.1, 2));
		shapes_in_use.cube.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.bruinBlue);

		model_transform = top_trans;
		// model_transform = mult(model_transform, translation(0, 0, -5));
		model_transform = mult(model_transform, translation(0, -0.15, 0));
		model_transform = mult(model_transform, rotation(90, [1, 0, 0]));
		model_transform = mult(model_transform, rotation(this.shared_scratchpad.camera_heading, [0, 0, 1]));
		shapes_in_use.circle.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.friedman);
	}
}, Animation);

Declare_Any_Class("Phone",
{
	'construct': function(context) {
		this.context = context;
		this.shared_scratchpad = context.shared_scratchpad;
		this.trans = -4;
		this.prev_time = 0;

		

		this.materials = {
			black: new Material(Color(40/255, 40/255, 40/255, 1), 0.4, 0.2, 0.2, 40)
		}
	},
	'display': function(time) {
		var model_transform = mat4();
		shaders_in_use[ "Default" ].activate();

		var delta = time - (this.prev_time > 0 ? this.prev_time : time);
		this.prev_time = time;
		if(this.trans < -0.75)
			this.trans += 0.2;
		else if(this.shared_scratchpad.cap_tex !== "friedman2") {
			this.shared_scratchpad.cap_tex = "friedman2";
			var handle = setInterval(function(self) {
				self.context.register_display_object("vader", new Darth_Vader(self.context));
	            var audio = new Audio("vader_breath.mp3");
	            audio.play();
			clearInterval(handle); return false;}, 500, this);
		// 	this.context.register_display_object("vader", new Darth_Vader(this.context));
  //           var audio = new Audio("vader_breath.mp3");
  //           audio.play();
		}

		model_transform = mult(inverse(this.shared_scratchpad.graphics_state.camera_transform), translation(-1.25, this.trans, -6));
		model_transform = mult(model_transform, rotation(230, [1, 0, 0]));
		model_transform = mult(model_transform, rotation(20, [0, 1, 0]));
		model_transform = mult(model_transform, rotation(-30, [0, 0, 1]));
		model_transform = mult(model_transform, scale(0.4, 0.4, 0.4));
		// model_transform = mult(model_transform, rotation())
		shapes_in_use.phone.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.black);
	}
}, Animation);

Declare_Any_Class("Darth_Vader",
{
	'construct': function(context) {
		this.shared_scratchpad = context.shared_scratchpad;
		this.trans = 4;
		this.prev_time = 0;

		

		

		this.materials = {
			vader_black: new Material(Color(0, 0, 0, 1), 0.4, 0.2, 0.2, 40, "vader")
		};
	},
	'display': function(time) {
		var model_transform = mat4();
		shaders_in_use[ "Default" ].activate();

		var delta = time - (this.prev_time > 0 ? this.prev_time : time);
		this.prev_time = time;
		if(this.trans > 0.15)
			this.trans -= 0.3; //delta/100;

		model_transform = mult(inverse(this.shared_scratchpad.graphics_state.camera_transform), translation(0, this.trans, -6));
		// model_transform = mult(model_transform, rotation(90, [1, 0, 0]));
		model_transform = mult(model_transform, scale(0.6, 0.6, 0.6));
		shapes_in_use.vader.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.vader_black);
	}
}, Animation);

// =============Item 1===============

Declare_Any_Class("Folder", 
{
	'construct': function(context) {
		this.shared_scratchpad = context.shared_scratchpad;
		// this.graphics_state = context.shared_scratchpad.graphics_state;

		// shapes_in_use.cube = new Cube();

		var texture_dir = "Common/textures/"
		textures_in_use.octocat = new Texture(texture_dir + "octocat.png", false);

		this.materials = {
			folderYellow: new Material( Color(255/255, 230/255, 153/255, 1), .2, .6, .8, 40),
			folderOctocat: new Material( Color(255/255, 230/255, 153/255, 1), .2, .6, .8, 40, "octocat")
		};

		this.buffer = gl.createBuffer();
	},
	'display': function(time) {
		var model_transform = mat4();
		shaders_in_use[ "Default" ].activate();

		var model_transform_stack = [];

		model_transform = mult(this.shared_scratchpad.camera_origin, rotation(200, [0, 1, 0]));
		model_transform = mult(model_transform, translation(0, 0, -30));
		
		var back_transform = model_transform;

		// model_transform_stack.push(model_transform);
// gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		model_transform = mult(model_transform, scale(2, 1.5, 0.05));
		model_transform_stack.push(model_transform);

		shapes_in_use.cube.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.folderYellow);

		model_transform = mult(model_transform, translation(-0.6, 0.65, 0));
		model_transform = mult(model_transform, scale(0.4, 1/1.5 * 0.8, 1));
		model_transform_stack.push(model_transform);
		
		shapes_in_use.cube.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.folderYellow);

		gl.enable( gl.BLEND );
		gl.blendEquation( gl.FUNC_ADD );
		gl.blendFunc( gl.ONE, gl.ONE_MINUS_SRC_ALPHA );

		model_transform = back_transform;
		model_transform = mult(model_transform, rotation(20, 1, 0, 0));
		model_transform = mult(model_transform, translation(0, 0.05, 0.3))
		model_transform = mult(model_transform, scale(2, 1.5, 0.05));
		model_transform_stack.push(model_transform);

		shapes_in_use.cube.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.folderOctocat);

		gl.disable( gl.BLEND );

		var aabb;
		// if(!this.shared_scratchpad.collision_mgr.bounding_volumes.folder) {
			// var col_mgr = this.shared_scratchpad.collision_mgr;
			aabb = new AABB([shapes_in_use.cube, shapes_in_use.cube, shapes_in_use.cube], model_transform_stack, this.shared_scratchpad.collision_mgr, "folder");
			// col_mgr.bounding_volumes.folder = aabb;
		// }
			
		// if(this.shared_scratchpad.collision_mgr.bounding_volumes.picker) console.log('folder col: ' + this.shared_scratchpad.collision_mgr.check_if_colliding_aabb_aabb(this.shared_scratchpad.collision_mgr.bounding_volumes.folder, this.shared_scratchpad.collision_mgr.bounding_volumes.picker));
		

		

		// var color = vec4(1.0, 1.0, 1.0, 1.0);
		// var vColor_loc = gl.getUniformLocation(shaders_in_use["Simple_Shader"].program, "vColor");
		// gl.uniform4fv(vColor_loc, flatten(color));
		
		// shaders_in_use["Simple_Shader"].update_uniforms( this.graphics_state, mat4());
  //       gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
  //       gl.bufferData( gl.ARRAY_BUFFER, flatten(aabb.positions), gl.STATIC_DRAW );
		
		// var posAttrib = g_addrs.shader_attributes[0];
  //       gl.vertexAttribPointer( posAttrib.index, posAttrib.size, posAttrib.type, posAttrib.enabled, posAttrib.normalized, posAttrib.stride, posAttrib.pointer);
  //       gl.enableVertexAttribArray( posAttrib.index );
  //       gl.drawArrays( gl.LINES, 0, 24);

 		// if(this.shared_scratchpad.draw_aabb) {
	  // 		shaders_in_use[ "Simple_Shader" ].activate();

	  // 		aabb.draw(this.graphics_state, shaders_in_use[ "Simple_Shader" ], Color(1, 1, 1, 1));
	  // 	}
	}
}, Animation);

Declare_Any_Class("Tag", 
{
	'construct': function(context) {
		this.shared_scratchpad = context.shared_scratchpad;
		// this.graphics_state = context.shared_scratchpad.graphics_state;

		shapes_in_use.square = new Square();
		shapes_in_use.octagon = new Regular_2D_Polygon(8, 8);
		// var models_dir = "Common/models/";
		// shapes_in_use.tag = new Shape_From_File(models_dir + "tag/tag.obj");

		var texture_dir = "Common/textures/";
		textures_in_use.ver1 = new Texture(texture_dir + "ver-1.0.jpg", false);

		this.materials = {
			tagYellow: new Material( Color(255/255, 230/255, 153/255, 1), .2, .6, .8, 40),
			tagVerYellow: new Material( Color(255/255, 230/255, 153/255, 1), .2, .6, .8, 40, "ver1")
		};
	},
	'display': function(time) {
		var model_transform = mat4();
		var transforms = [];
		shaders_in_use[ "Default" ].activate();

		if(this.shared_scratchpad.target_item !== this.shared_scratchpad.collision_mgr.bounding_volumes.tag || !this.shared_scratchpad.target_item_picked_up) {
			

			var model_transform_stack = [];
			model_transform = mult(this.shared_scratchpad.camera_origin, rotation(90, [0, 1, 0]));
			model_transform = mult(model_transform, translation(0, 0, -30));

			model_transform_stack.push(model_transform);
	// gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
			model_transform = mult(model_transform, scale(1, 0.75, 0.05));
			transforms.push(model_transform);

			shapes_in_use.octagon.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.tagYellow);
			// shapes_in_use.tag.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.tagYellow);

			model_transform = mult(model_transform, translation(-0.7, -0.28, 0.01));
			// model_transform = mult(model_transform, rotation(-68, [0, 0, 1]));
			model_transform = mult(model_transform, rotation(22, [0, 0, 1]));
			model_transform = mult(model_transform, scale(0.9275, 1/0.75 * 0.695, 1));
			transforms.push(model_transform);
			
			shapes_in_use.square.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.tagVerYellow);

			

			

			// if(!this.shared_scratchpad.collision_mgr.bounding_volumes.tag) {
				
			// }

			// if(this.shared_scratchpad.draw_aabb) {
			// 	shaders_in_use[ "Simple_Shader" ].activate();

			// 	this.shared_scratchpad.collision_mgr.bounding_volumes.tag.draw(this.graphics_state, shaders_in_use[ "Simple_Shader" ], Color(1, 1, 1, 1));
			// }

			// gl.enable( gl.BLEND );
			// gl.blendEquation( gl.FUNC_ADD );
			// gl.blendFunc( gl.ONE, gl.ONE_MINUS_SRC_ALPHA );

			// model_transform = model_transform_stack.pop();
			// model_transform = mult(model_transform, rotation(20, 1, 0, 0));
			// model_transform = mult(model_transform, translation(0, 0.05, 0.3))
			// model_transform = mult(model_transform, scale(1, 0.75, 0.05));
			// shapes_in_use.cube.draw(this.graphics_state, model_transform, this.materials.folderOctocat);
		} else {
			model_transform = this.shared_scratchpad.char_arm_transform;
			model_transform = mult(model_transform, translation(0, 0, 1.4));
			transforms.push(model_transform);
			// shapes_in_use.tag.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.tagYellow);
			shapes_in_use.octagon.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.tagYellow);

			model_transform = mult(model_transform, translation(-0.7, -0.28, 0.01));
			// model_transform = mult(model_transform, rotation(-68, [0, 0, 1]));
			model_transform = mult(model_transform, rotation(22, [0, 0, 1]));
			model_transform = mult(model_transform, scale(0.9275, 1/0.75 * 0.695, 1));
			transforms.push(model_transform);
			
			shapes_in_use.square.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.tagVerYellow);
		}

		new AABB([shapes_in_use.octagon, shapes_in_use.square], transforms, this.shared_scratchpad.collision_mgr, "tag");
	}
}, Animation);

// =============Item 2===============

Declare_Any_Class("Swipe_Token",
{
	'construct': function(context) {
		this.shared_scratchpad = context.shared_scratchpad;
		// this.graphics_state = context.shared_scratchpad.graphics_state;

		shapes_in_use.cylinder = new Capped_Cylinder(20, 20);

		textures_in_use.swipes = new Texture("Common/textures/swipes-for-homeless.jpg", false);

		this.materials = {
			white: new Material(Color(1, 1, 1, 1), 0.2, 0.4, 0.2, 40, "swipes")
		}
	},
	'display': function(time) {
		var model_transform = mat4();
		shaders_in_use["Default"].activate();

		model_transform = mult(this.shared_scratchpad.camera_origin, rotation(-135, [0, 1, 0]));
		model_transform = mult(model_transform, translation(0, 0, -30));
		model_transform = mult(model_transform, scale(1.5, 1.5, 0.2));
		shapes_in_use.cylinder.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.white);

		// if(!this.shared_scratchpad.collision_mgr.bounding_volumes.swipe) {
			new AABB([shapes_in_use.cylinder], [model_transform], this.shared_scratchpad.collision_mgr, "swipe_token");
		// }

		// if(this.shared_scratchpad.draw_aabb) {
		// 	shaders_in_use[ "Simple_Shader" ].activate();

		// 	this.shared_scratchpad.collision_mgr.bounding_volumes.swipe_token.draw(this.graphics_state, shaders_in_use[ "Simple_Shader" ], Color(1, 1, 1, 1));
		// }
	}
}, Animation);

Declare_Any_Class("Bruin_Card",
{
	'construct': function(context) {
		this.shared_scratchpad = context.shared_scratchpad;
		// this.graphics_state = context.shared_scratchpad.graphics_state;

		// textures_in_use.swipes = new Texture("Common/textures/swipes-for-homeless.jpg", false);

        textures_in_use.bcard = new Texture("Common/textures/bcard.png", true);

		this.materials = {
			bcard: new Material(Color(116 / 255, 209 / 255, 234 / 255, 1), 0.2, 0.4, 0.2, 40, "bcard"),
		}
	},
	'display': function(time) {
		var model_transform = mat4();
		shaders_in_use["Default"].activate();

		if(this.shared_scratchpad.target_item !== this.shared_scratchpad.collision_mgr.bounding_volumes.bruin_card || !this.shared_scratchpad.target_item_picked_up) {
			model_transform = mult(this.shared_scratchpad.camera_origin, rotation(-90, [0, 1, 0]));
			model_transform = mult(model_transform, translation(0, 0, -30));
			model_transform = mult(model_transform, scale(1.5, 1, 1));
			// bcard_MT = mult(model_transform, translation(30, 1, 10));
   //      bcard_MT = mult(bcard_MT, scale(5, 3, 1));
        	shapes_in_use.strip.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.bcard);

			// shapes_in_use.cube.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.white);
		} else {
			model_transform = this.shared_scratchpad.char_arm_transform;
			model_transform = mult(model_transform, translation(0, 0, 1.4));
			shapes_in_use.strip.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.bcard);
		}
		

		// if(!this.shared_scratchpad.collision_mgr.bounding_volumes.swipe) {
			new AABB([shapes_in_use.strip], [model_transform], this.shared_scratchpad.collision_mgr, "bruin_card");
		// }

		// if(this.shared_scratchpad.draw_aabb) {
		// 	shaders_in_use[ "Simple_Shader" ].activate();

		// 	this.shared_scratchpad.collision_mgr.bounding_volumes.bruin_card.draw(this.graphics_state, shaders_in_use[ "Simple_Shader" ], Color(1, 1, 1, 1));
		// }
	}
}, Animation);

// =============Item 3===============

Declare_Any_Class("Dinner_Strangers",
{
	'construct': function(context) {
		this.shared_scratchpad = context.shared_scratchpad;

		textures_in_use.swipes = new Texture("Common/textures/dinner-12-strangers.png", false);

		this.materials = {
			white: new Material(Color(1, 1, 1, 1), 0.2, 0.4, 0.2, 40, "swipes")
		}
	},
	'display': function(time) {
		var model_transform = mat4();
		shaders_in_use["Default"].activate();

		model_transform = mult(this.shared_scratchpad.camera_origin, rotation(45, [0, 1, 0]));
		model_transform = mult(model_transform, translation(0, 0, -30));
		model_transform = mult(model_transform, scale(1.5, 1.5, 0.2));
		shapes_in_use.cube.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.white);

		new AABB([shapes_in_use.cube], [model_transform], this.shared_scratchpad.collision_mgr, "dinner_strangers");
	}
}, Animation);

Declare_Any_Class("Invite",
{
	'construct': function(context) {
		this.shared_scratchpad = context.shared_scratchpad;

		textures_in_use.env = new Texture("Common/textures/envelope.png", false);

		this.materials = {
			white: new Material(Color(1, 1, 1, 1), 0.2, 0.4, 0.2, 40, "env")
		}
	},
	'display': function(time) {
		var model_transform = mat4();
		shaders_in_use["Default"].activate();

		if(this.shared_scratchpad.target_item !== this.shared_scratchpad.collision_mgr.bounding_volumes.invite || !this.shared_scratchpad.target_item_picked_up) {
			model_transform = mult(this.shared_scratchpad.camera_origin, rotation(-90, [0, 1, 0]));
			model_transform = mult(model_transform, translation(0, 0, -30));
			shapes_in_use.strip.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.white);
		} else {
			model_transform = this.shared_scratchpad.char_arm_transform;
			model_transform = mult(model_transform, translation(0, 0, 1.4));
			shapes_in_use.strip.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.white);
		}
		
		new AABB([shapes_in_use.strip], [model_transform], this.shared_scratchpad.collision_mgr, "invite");
	}
}, Animation);