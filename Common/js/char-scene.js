Declare_Any_Class("Character_Scene",
{
	'construct': function(context) {
		this.shared_scratchpad = context.shared_scratchpad;
		this.graphics_state = context.shared_scratchpad.graphics_state;

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
	},
	'display': function(time) {
		var model_transform = mat4();
		shaders_in_use[ "Default" ].activate();

		// this.graphics_state.lights = [new Light( vec4( 5, 0, 5, 1 ), Color( 0, 1, 0, 1 ), 100000000 )];

		// Body

		model_transform = mult(model_transform, translation(0, 1.75, -45));

		var bodyCenter = model_transform;

		model_transform = mult(model_transform, scale(1.25, 1.5, 1));
		shapes_in_use.cube.draw(this.graphics_state, model_transform, this.materials.icyGrey);

		// Head

		model_transform = bodyCenter;

		model_transform = mult(model_transform, translation(0, 3, 0));
		model_transform = mult(model_transform, scale(2.5, 1.5, 1.5));
		shapes_in_use.cube.draw(this.graphics_state, model_transform, this.materials.blueGreen);

		// Eyes

		var head_transform = model_transform;

		for(var i = 0; i < 2; i++) {
			model_transform = head_transform;

			// model_transform = mult(model_transform, translation(0.35 * Math.pow(-1, i), 0.2, 1.67));
			model_transform = mult(model_transform, translation(0.35 * Math.pow(-1, i), 0.2, 1.01));
			model_transform = mult(model_transform, scale(1/2.5 * 0.25, 1/1.5 * 0.25, 1/1.5));
			shapes_in_use.circle.draw(this.graphics_state, model_transform, this.materials.yellow);
		}

		// Mouth

		model_transform = head_transform;

		model_transform = mult(model_transform, translation(0, -0.15, 1.01));
		model_transform = mult(model_transform, scale(1/2.5 * 0.5, 1/1.5 * 0.5, 1/1.5 * 0.5));
		model_transform = mult(model_transform, rotation(-135, 0, 0, 1));
		shapes_in_use.triangle.draw(this.graphics_state, model_transform, this.materials.yellow);


		// Joints + Arms

		for(var i = 0; i < 2; i++) {
			model_transform = bodyCenter;

			model_transform = mult(model_transform, translation(1.75 * Math.pow(-1, i), 0.825, 0));
			model_transform = mult(model_transform, scale(0.5, 0.5, 0.5));
			shapes_in_use.sphere.draw(this.graphics_state, model_transform, this.materials.lightBlue);

			// Add condition for rotation here (for walking)
			model_transform = mult(model_transform, rotation(25 * Math.pow(-1, i) * Math.sin(this.graphics_state.animation_time/300), 1, 0, 0));
			model_transform = mult(model_transform, translation(0, -4, 0));
			model_transform = mult(model_transform, scale(1, 3, 1));
			shapes_in_use.cube.draw(this.graphics_state, model_transform, this.materials.lightBlue);
		}

		// Joints + Legs

		for(var i = 0; i < 2; i++) {
			model_transform = bodyCenter;

			model_transform = mult(model_transform, translation(0.675 * Math.pow(-1, i), -2, 0));
			model_transform = mult(model_transform, scale(0.5, 0.5, 0.5));
			shapes_in_use.sphere.draw(this.graphics_state, model_transform, this.materials.lightBlue);

			// Add condition for rotation here (for walking)
			model_transform = mult(model_transform, rotation(25 * Math.pow(-1, i) * -Math.sin(this.graphics_state.animation_time/300), 1, 0, 0));
			model_transform = mult(model_transform, translation(0, -3, 0));
			model_transform = mult(model_transform, scale(1, 2, 1));
			shapes_in_use.cube.draw(this.graphics_state, model_transform, this.materials.lightBlue);
		}
	}, 
}, Animation);