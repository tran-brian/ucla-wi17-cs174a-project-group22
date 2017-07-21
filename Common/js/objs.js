Declare_Any_Class("Obj",
{
	'construct': function(context) {
		this.shared_scratchpad = context.shared_scratchpad;
		this.graphics_state = context.shared_scratchpad.graphics_state;

		var models_dir = "Common/models/";
		shapes_in_use.tbp = new Shape_From_File(models_dir + "tbp/tbp.obj");
        shapes_in_use.powell1 = new Shape_From_File(models_dir + "powell1_/powell1_.obj");
        shapes_in_use.powell2 = new Shape_From_File(models_dir + "powell2/powell2.obj");
        shapes_in_use.powell3 = new Shape_From_File(models_dir + "powell3/powell3.obj");
        shapes_in_use.boelter1 = new Shape_From_File(models_dir + "boelter1/boelter1.obj");
        shapes_in_use.boelter2 = new Shape_From_File(models_dir + "boelter2/boelter2.obj");
        shapes_in_use.boelter3 = new Shape_From_File(models_dir + "boelter3/boelter3.obj");
		

		var texture_dir = "Common/textures/";
		textures_in_use.ivory = new Texture(texture_dir + "ivory.png", false);
        textures_in_use.lightbrown = new Texture(texture_dir + "lightbrown.png", false);
        textures_in_use.darkbrown = new Texture(texture_dir + "darkbrown.png", false);

		this.materials = {
			white: new Material(Color(255 / 255, 255 / 255, 255 / 255, 1), .6, .6, .8, 40),
            yellow: new Material(Color(255 / 255, 236 / 255, 45 / 255, 1), .4, .6, .8, 40),
            ivory: new Material(Color(252 / 255, 241 / 255, 188 / 255, 1), .4, 0.5, .8, 40, "ivory"),
            lightbrown: new Material(Color(210 / 255, 131 / 255, 83 / 255, 1), .4, 0.5, .8, 40, "lightbrown"),
            darkbrown: new Material(Color(109 / 255, 60 / 255, 29 / 255, 1), .4, 0.5, .8, 40, "darkbrown"),
			tagWhite: new Material(Color(1, 1, 1, 1), 0.4, 0.4, 0.2, 40, "ver1"),
			red: new Material(Color(1, 0, 0, 1), 0.4, 0.4, 0.2, 40)
		};

		// var timer = setInterval(checkObjReady, 500);

		// var self = this;
		// function checkObjReady() {
		// 	if(shapes_in_use.kook.ready) {
		// 		var aabb = new AABB([shapes_in_use.kook], [translation(0, 0, -4)]);
		// 		self.shared_scratchpad.collision_mgr.bounding_volumes.kook = aabb;
		// 		console.log('kook: ' + self.shared_scratchpad.collision_mgr.check_if_colliding_aabb_aabb(self.shared_scratchpad.collision_mgr.bounding_volumes.kook, self.shared_scratchpad.collision_mgr.bounding_volumes.aabb));

		// 		clearInterval(timer);
		// 		return;
		// 	}
		// }

		// this.buffer = gl.createBuffer();
	},
	'display': function(time) {
		var model_transform = mat4();
		shaders_in_use[ "Default" ].activate();

		tbp_MT = mult(model_transform, rotation(100, vec3(0, 1, 0)));
        tbp_MT = mult(tbp_MT, translation(-16, -1.6, 40));
        tbp_MT = mult(tbp_MT, scale(1, 1, 1));
        shapes_in_use.tbp.draw(this.graphics_state, tbp_MT, this.materials.yellow);

        powell1_MT = mult(model_transform, rotation(90, vec3(0, 0, 1)));
        powell1_MT = mult(powell1_MT, rotation(90, vec3(0, 1, 0)));
        powell1_MT = mult(powell1_MT, translation(-50, 30, 2.6));
        powell1_MT = mult(powell1_MT, rotation(150, vec3(0, 0, 1)));
        powell1_MT = mult(powell1_MT, scale(18, 18, 18));
        shapes_in_use.powell1.draw(this.graphics_state, powell1_MT, this.materials.ivory);

        powell2_MT = mult(model_transform, rotation(90, vec3(0, 0, 1)));
        powell2_MT = mult(powell2_MT, rotation(90, vec3(0, 1, 0)));
        powell2_MT = mult(powell2_MT, translation(-52.25, 31.78, 15));
        powell2_MT = mult(powell2_MT, rotation(150, vec3(0, 0, 1)));
        powell2_MT = mult(powell2_MT, scale(7.3, 7.3,7.3));
        shapes_in_use.powell2.draw(this.graphics_state, powell2_MT, this.materials.darkbrown);

        powell3_MT = mult(model_transform, rotation(90, vec3(0, 0, 1)));
        powell3_MT = mult(powell3_MT, rotation(90, vec3(0, 1, 0)));
        powell3_MT = mult(powell3_MT, translation(-52.5, 31.5, 13.4));
        powell3_MT = mult(powell3_MT, rotation(150, vec3(0, 0, 1)));
        powell3_MT = mult(powell3_MT, scale(12.8, 12.8, 11.7));
        shapes_in_use.powell3.draw(this.graphics_state, powell3_MT, this.materials.lightbrown);

        boelter1_MT = mult(model_transform, translation(50, 5.8, 20));
        boelter1_MT = mult(boelter1_MT, rotation(270, vec3(1, 0, 0)));
        boelter1_MT = mult(boelter1_MT, rotation(250, vec3(0, 0, 1)));
        boelter1_MT = mult(boelter1_MT, scale(20, 20, 20));
        shapes_in_use.boelter1.draw(this.graphics_state, boelter1_MT, this.materials.lightbrown);

        boelter2_MT = mult(model_transform, translation(46, 4.5, 18.7));
        boelter2_MT = mult(boelter2_MT, rotation(270, vec3(1, 0, 0)));
        boelter2_MT = mult(boelter2_MT, rotation(250, vec3(0, 0, 1)));
        boelter2_MT = mult(boelter2_MT, scale(17, 15, 17));
        shapes_in_use.boelter2.draw(this.graphics_state, boelter2_MT, this.materials.ivory);

        boelter3_MT = mult(model_transform, translation(44, 2, 27));
        boelter3_MT = mult(boelter3_MT, rotation(-90, vec3(1, 0, 0)));
        boelter3_MT = mult(boelter3_MT, rotation(-105, vec3(0, 0, 1)));
        boelter3_MT = mult(boelter3_MT, scale(2, 2, 2));
        shapes_in_use.boelter3.draw(this.graphics_state, boelter3_MT, this.materials.yellow);

		// shaders_in_use[ "Simple_Shader" ].activate();

		// var color = vec4(1.0, 1.0, 1.0, 1.0);
		// var vColor_loc = gl.getUniformLocation(shaders_in_use["Simple_Shader"].program, "vColor");
		// gl.uniform4fv(vColor_loc, flatten(color));
		
		// if(shapes_in_use.kook.ready) {
		// 	if(!this.shared_scratchpad.collision_mgr.bounding_volumes.kook) {
		// 		var aabb = new AABB([shapes_in_use.kook], [model_transform], this.shared_scratchpad.collision_mgr, "kook");
		// 		// this.shared_scratchpad.collision_mgr.bounding_volumes.kook = aabb;
		// 		console.log('kook: ' + this.shared_scratchpad.collision_mgr.check_if_colliding_aabb_aabb(this.shared_scratchpad.collision_mgr.bounding_volumes.kook, this.shared_scratchpad.collision_mgr.bounding_volumes.aabb));
		// 	}

			// shaders_in_use["Simple_Shader"].update_uniforms( this.graphics_state, mat4());
	  //       gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
	  //       gl.bufferData( gl.ARRAY_BUFFER, flatten(this.shared_scratchpad.collision_mgr.bounding_volumes.kook.positions), gl.STATIC_DRAW );
			
			// var posAttrib = g_addrs.shader_attributes[0];
	  //       gl.vertexAttribPointer( posAttrib.index, posAttrib.size, posAttrib.type, posAttrib.enabled, posAttrib.normalized, posAttrib.stride, posAttrib.pointer);
	  //       gl.enableVertexAttribArray( posAttrib.index );
	  //       gl.drawArrays( gl.LINES, 0, 24);
	  		// this.shared_scratchpad.collision_mgr.bounding_volumes.kook.draw(this.graphics_state, shaders_in_use["Simple_Shader"], Color(0, 0, 1, 1));
	    // }

	    // shaders_in_use[ "Default" ].activate();

	    // shapes_in_use.tag.draw(this.graphics_state, translation(0, 0, -5), this.materials.tagWhite);
	}
}, Animation);