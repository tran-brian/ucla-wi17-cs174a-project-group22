Declare_Any_Class("Picker",
{
	'construct': function(context) {
		this.shared_scratchpad = context.shared_scratchpad;
		this.graphics_state = context.shared_scratchpad.graphics_state;

		// shapes_in_use.circle = new Circle(10, 10);

		this.materials = {
			transparent: new Material(Color(1, 1, 1, 1), 0.4, 0.4, 0.2, 40)
		};

		this.fake_shape = {
			positions: [
				vec3(-1, -1, -1), vec3(1, 1, 1)
			]
		}
	},
	'display': function(time) {
		shaders_in_use[ "Default" ].activate();

		var model_transform = mult(inverse(this.graphics_state.camera_transform), translation(0, 0, -30));
		model_transform = mult(model_transform, scale(0.05, 0.05, 0.05));

		// if(!this.shared_scratchpad.collision_mgr.bounding_volumes.picker) {
			var aabb = new AABB([this.fake_shape], [model_transform], this.shared_scratchpad.collision_mgr, "picker");
			// this.shared_scratchpad.collision_mgr.bounding_volumes.picker = aabb;
		// }

		// if(this.shared_scratchpad.collision_mgr.bounding_volumes.tag)
		// console.log('picker + tag: ' + this.shared_scratchpad.collision_mgr.check_if_colliding_aabb_aabb(this.shared_scratchpad.collision_mgr.bounding_volumes.picker, this.shared_scratchpad.collision_mgr.bounding_volumes.tag));

		// shapes_in_use.circle.draw(this.graphics_state, model_transform, this.materials.transparent);

		// shaders_in_use[ "Simple_Shader" ].activate();

		// this.shared_scratchpad.collision_mgr.bounding_volumes.picker.draw(this.graphics_state, shaders_in_use[ "Simple_Shader" ], Color(1, 1, 1, 1));
	}
}, Animation);