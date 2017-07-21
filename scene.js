// UCLA's Graphics Example Code (Javascript and C++ translations available), by Garett Ridge for CS174a.
// example-displayables.js - The subclass definitions here each describe different independent animation processes that you want to fire off each frame, by defining a display
// event and how to react to key and mouse input events.  Make one or two of your own subclasses, and fill them in with all your shape drawing calls and any extra key / mouse controls.

// Now go down to Example_Animation's display() function to see where the sample shapes you see drawn are coded, and a good place to begin filling in your own code.

Declare_Any_Class( "Debug_Screen",  // Debug_Screen - An example of a displayable object that our class Canvas_Manager can manage.  Displays a text user interface.
  { 'construct': function( context )
      { this.define_data_members( { string_map: context.shared_scratchpad.string_map, start_index: 0, tick: 0, visible: false, graphicsState: new Graphics_State() } );
        shapes_in_use.debug_text = new Text_Line( 35 );
      },
    'init_keys': function( controls )
      { controls.add( "t",    this, function() { this.visible ^= 1;                                                                                                             } );
        controls.add( "up",   this, function() { this.start_index = ( this.start_index + 1 ) % Object.keys( this.string_map ).length;                                           } );
        controls.add( "down", this, function() { this.start_index = ( this.start_index - 1   + Object.keys( this.string_map ).length ) % Object.keys( this.string_map ).length; } );
        this.controls = controls;
      },
    'update_strings': function( debug_screen_object )   // Strings that this displayable object (Debug_Screen) contributes to the UI:
      { debug_screen_object.string_map["tick"]              = "Frame: " + this.tick++;
        debug_screen_object.string_map["text_scroll_index"] = "Text scroll index: " + this.start_index;
      },
    'display': function( time )
      { if( !this.visible ) return;

        shaders_in_use["Default"].activate();
        gl.uniform4fv( g_addrs.shapeColor_loc, Color( .8, .8, .8, 1 ) );

        var font_scale = scale( .02, .04, 1 ),
            model_transform = mult( translation( -.95, -.9, 0 ), font_scale ),
            strings = Object.keys( this.string_map );

        for( var i = 0, idx = this.start_index; i < 4 && i < strings.length; i++, idx = (idx + 1) % strings.length )
        {
          shapes_in_use.debug_text.set_string( this.string_map[ strings[idx] ] );
          shapes_in_use.debug_text.draw( this.graphicsState, model_transform, true, vec4(0,0,0,1) );  // Draw some UI text (strings)
          model_transform = mult( translation( 0, .08, 0 ), model_transform );
        }
        model_transform = mult( translation( .7, .9, 0 ), font_scale );
        shapes_in_use.debug_text.set_string( "Controls:" );
        shapes_in_use.debug_text.draw( this.graphicsState, model_transform, true, vec4(0,0,0,1) );    // Draw some UI text (controls title)

        for( let k of Object.keys( this.controls.all_shortcuts ) )
        {
          model_transform = mult( translation( 0, -0.08, 0 ), model_transform );
          shapes_in_use.debug_text.set_string( k );
          shapes_in_use.debug_text.draw( this.graphicsState, model_transform, true, vec4(0,0,0,1) );  // Draw some UI text (controls)
        }
      }
  }, Animation );

Declare_Any_Class( "Example_Camera",     // An example of a displayable object that our class Canvas_Manager can manage.  Adds both first-person and
  { 'construct': function( context )     // third-person style camera matrix controls to the canvas.
      { // 1st parameter below is our starting camera matrix.  2nd is the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
        context.shared_scratchpad.graphics_state = new Graphics_State( translation(0, 0, 0), perspective(50, canvas.width/canvas.height, .1, 1000), 0 );
        context.shared_scratchpad.ortho_graphics_state = new Graphics_State(translation(0, 0, 0), ortho(-gl.canvas.clientWidth, gl.canvas.clientWidth, -gl.canvas.clientHeight, gl.canvas.clientHeight, 1, -400));
        this.define_data_members( { graphics_state: context.shared_scratchpad.graphics_state, thrust: vec3(), origin: vec3( 0, 5, 0 ), looking: false, heading: 0, pitch: 0, initial_transform: null, n: 1 } );

        this.shared_scratchpad    = context.shared_scratchpad;

        this.initial_transform = this.graphics_state.camera_transform;
        this.shared_scratchpad.camera_origin = this.graphics_state.camera_transform;
        this.shared_scratchpad.camera_heading = 0;

        shapes_in_use.circle = new Regular_2D_Polygon(10, 10);

        this.materials = {
          brightRed: new Material( Color(240/255, 81/255, 54/255, 1), .8, .8, .4, 40),
          lightBlue: new Material( Color(116/255, 209/255, 234/255, 1), .2, .6, .8, 40)
        };

        // *** Mouse controls: ***
        // this.mouse = { "from_center": vec2() };
        // var mouse_position = function( e ) { return vec2( e.clientX - canvas.width/2, e.clientY - canvas.height/2 ); };   // Measure mouse steering, for rotating the flyaround camera.
        // canvas.addEventListener( "mouseup",   ( function(self) { return function(e) { e = e || window.event;    self.mouse.anchor = undefined;              } } ) (this), false );
        canvas.addEventListener( "mousedown", (
          function(self) {
            return function(e) {
              e = e || window.event;
              // self.mouse.anchor = mouse_position(e);

              if(e.button === 0 && !self.shared_scratchpad.target_item_picked_up) { // left mouse btn
                // var b_vols = self.shared_scratchpad.collision_mgr.bounding_volumes;
                // if(b_vols.char && b_vols.tag && b_vols.picker && !self.shared_scratchpad.first_item_picked_up) {
                //   self.shared_scratchpad.first_item_picked_up = self.shared_scratchpad.collision_mgr.check_if_colliding_aabb_aabb(b_vols.char, b_vols.tag) && self.shared_scratchpad.collision_mgr.check_if_colliding_aabb_aabb(b_vols.tag, b_vols.picker);
                //   console.log('char + picker + tag: ' + self.shared_scratchpad.first_item_picked_up);
                // } else if(b_vols.char && b_vols.folder && b_vols.picker && self.shared_scratchpad.first_item_picked_up) {
                //   self.shared_scratchpad.first_goal_reached = self.shared_scratchpad.collision_mgr.check_if_colliding_aabb_aabb(b_vols.char, b_vols.folder) && self.shared_scratchpad.collision_mgr.check_if_colliding_aabb_aabb(b_vols.folder, b_vols.picker);
                //   context.unregister_display_object("tag");
                //   context.unregister_display_object("folder");
                //   console.log('char + picker + folder: ' + self.shared_scratchpad.first_goal_reached);
                // }

                self.shared_scratchpad.target_item_picked_up = self.shared_scratchpad.collision_mgr.check_if_colliding_aabb_aabb(self.shared_scratchpad.collision_mgr.bounding_volumes.char, self.shared_scratchpad.target_item) && self.shared_scratchpad.collision_mgr.check_if_colliding_aabb_aabb(self.shared_scratchpad.collision_mgr.bounding_volumes.picker, self.shared_scratchpad.target_item);
              }
            }
          } ) (this), false );

        document.getElementById("pause_screen").onclick = function(e) {gl.canvas.click(e);};

        // canvas.addEventListener( "mousemove", (
        //   function(self) {
        //     return function(e) {
        //       e = e || window.event;
        //       self.mouse.from_center = mouse_position(e);

        //       // if(self.mouse.from_center[0] > 360) {
        //       //   self.heading = self.n % 360; console.log('move heading right');
        //       // } else if(self.mouse.from_center[0] < -360) {
        //       //   self.heading = -self.n % 360; console.log('move heading left');
        //       // } else {
        //       //   self.heading = 0; //console.log('heading not moving');
        //       // }
        //     }
        //   } ) (this), false );
        // canvas.addEventListener( "mouseout",  ( function(self) { return function(e) { self.mouse.from_center = vec2(); }; } ) (this), false );    // Stop steering if the mouse leaves the canvas.



        // pointer lock object forking for cross browser
        canvas.requestPointerLock = canvas.requestPointerLock ||
                                    canvas.mozRequestPointerLock ||
                                    element.webkitRequestPointerLock;

        document.exitPointerLock = document.exitPointerLock ||
                                   document.mozExitPointerLock ||
                                   document.webkitExitPointerLock;

        // when canvas is clicked, lock pointer
        canvas.onclick = function() {
          canvas.requestPointerLock();
        };

        // pointer lock event listeners

        // store this into a variable for access in event listener functions
        var instance = this;

        // Hook pointer lock state change events for different browsers
        document.addEventListener('pointerlockchange', lockChangeAlert, false);
        document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
        document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

        function lockChangeAlert() {
          if (document.pointerLockElement === canvas ||
              document.mozPointerLockElement === canvas ||
              document.webkitPointerLockElement === canvas) {
            console.log('The pointer lock status is now locked');
            document.addEventListener("mousemove", updatePosition, false);
            document.getElementById("pause_screen").style.display = "none";
            document.getElementById("audio").play();
            instance.shared_scratchpad.animate = true;
            render = true;
          } else {
            console.log('The pointer lock status is now unlocked');
            document.removeEventListener("mousemove", updatePosition, false);
            document.getElementById("pause_screen").style.display = "block";
            document.getElementById("audio").pause();
            instance.shared_scratchpad.animate = false;
            render = false;
          }
        }

        //var timeout = null;

        function updatePosition(e) {
            var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
            instance.heading += movementX / 10;

            //clearTimeout(timeout);
            //timeout = setTimeout(function() { instance.heading = 0; instance.pitch = 0; }, 100);
        }

        // clear the change in heading & pitch to 0 every 100ms (instance.heading & instance.pitch represent change every frame)
        var position_poll_handle = setInterval(function(self) {
          if(self.shared_scratchpad.all_goals_reached) {
            document.exitPointerLock();
            canvas.onclick = null;

            document.removeEventListener("mousemove", updatePosition, false);

            document.removeEventListener('pointerlockchange', lockChangeAlert, false);
            document.removeEventListener('mozpointerlockchange', lockChangeAlert, false);
            document.removeEventListener('webkitpointerlockchange', lockChangeAlert, false);

            clearInterval(position_poll_handle);

            // this.shared_scratchpad.pointer_lock_disabled = true;
          }

          instance.heading = 0;
          instance.pitch = 0;
        }, 100, this);
      },
    'init_keys': function( controls )   // init_keys():  Define any extra keyboard shortcuts here
      { 
        this.controls = controls;

        controls.add("left", this, function() {this.heading = -this.n % 360;});      controls.add("left", this, function() {this.heading = 0;}, {'type':'keyup'});
        controls.add("right", this, function() {this.heading = this.n % 360;});      controls.add("right", this, function() {this.heading = 0;}, {'type':'keyup'});
        controls.add("up", this, function() {this.pitch = -this.n % 360;});      controls.add("up", this, function() {this.heading = 0;}, {'type':'keyup'});
        controls.add("down", this, function() {this.pitch = this.n % 360;});      controls.add("down", this, function() {this.heading = 0;}, {'type':'keyup'});
        
        controls.add("m", this, function() {document.getElementById("audio").muted ^= 1;}, {'type':'keyup'});
        controls.add("b", this, function() {this.shared_scratchpad.draw_aabb ^= 1;}, {'type':'keyup'});;
      },
    'update_strings': function( user_interface_string_manager )       // Strings that this displayable object (Animation) contributes to the UI:
      { var C_inv = inverse( this.graphics_state.camera_transform ), pos = mult_vec( C_inv, vec4( 0, 0, 0, 1 ) ),
                                                                  z_axis = mult_vec( C_inv, vec4( 0, 0, 1, 0 ) );
        user_interface_string_manager.string_map["origin" ] = "Center of rotation: " + this.origin[0].toFixed(0) + ", " + this.origin[1].toFixed(0) + ", " + this.origin[2].toFixed(0);
        user_interface_string_manager.string_map["cam_pos"] = "Cam Position: " + pos[0].toFixed(2) + ", " + pos[1].toFixed(2) + ", " + pos[2].toFixed(2);    // The below is affected by left hand rule:
        user_interface_string_manager.string_map["facing" ] = "Facing: "       + ( ( z_axis[0] > 0 ? "West " : "East ") + ( z_axis[1] > 0 ? "Down " : "Up " ) + ( z_axis[2] > 0 ? "North" : "South" ) );
      },
    'display': function( time )
      { var leeway = 70,  degrees_per_frame = .0004 * this.graphics_state.animation_delta_time,
                          meters_per_frame  =   .01 * this.graphics_state.animation_delta_time;

          // Third-person camera mode: Is a mouse drag occurring?
          // if( this.mouse.anchor )
          // {
          //   var dragging_vector = subtract( this.mouse.from_center, this.mouse.anchor );            // Arcball camera: Spin the scene around the world origin on a user-determined axis.
          //   if( length( dragging_vector ) > 0 )
          //     this.graphics_state.camera_transform = mult( this.graphics_state.camera_transform,    // Post-multiply so we rotate the scene instead of the camera.
          //         mult( translation( this.origin ),
          //         mult( rotation( .05 * length( dragging_vector ), dragging_vector[1], dragging_vector[0], 0 ),
          //               translation(scale_vec( -1, this.origin ) ) ) ) );
          // }
          // // First-person flyaround mode:  Determine camera rotation movement when the mouse is past a minimum distance (leeway) from the canvas's center.
          // var offset_plus  = [ this.mouse.from_center[0] + leeway, this.mouse.from_center[1] + leeway ];
          // var offset_minus = [ this.mouse.from_center[0] - leeway, this.mouse.from_center[1] - leeway ];

          // for( var i = 0; this.looking && i < 2; i++ )      // Steer according to "mouse_from_center" vector, but don't start increasing until outside a leeway window from the center.
          // {
          //   var velocity = ( ( offset_minus[i] > 0 && offset_minus[i] ) || ( offset_plus[i] < 0 && offset_plus[i] ) ) * degrees_per_frame;  // Use movement's quantity unless the &&'s zero it out
          //   this.graphics_state.camera_transform = mult( rotation( velocity, i, 1-i, 0 ), this.graphics_state.camera_transform );     // On X step, rotate around Y axis, and vice versa.
          // }     // Now apply translation movement of the camera, in the newest local coordinate frame

          this.shared_scratchpad.camera_heading += this.heading;
          this.graphics_state.camera_transform = mult(rotation(this.heading, 0, 1, 0), this.graphics_state.camera_transform);
          this.graphics_state.camera_transform = mult(rotation(this.pitch, 1, 0, 0), this.graphics_state.camera_transform);
          this.graphics_state.camera_transform = mult( translation( scale_vec( meters_per_frame, this.thrust ) ), this.graphics_state.camera_transform );

          if(!this.shared_scratchpad.all_goals_reached) {
            shaders_in_use[ "Default" ].activate();
            var model_transform = mat4();
            // shapes_in_use.circle.draw(this.shared_scratchpad.ortho_graphics_state, model_transform, this.materials.brightRed);

            
            var picker_item_colliding = this.shared_scratchpad.collision_mgr.bounding_volumes.picker && this.shared_scratchpad.target_item && this.shared_scratchpad.collision_mgr.check_if_colliding_aabb_aabb(this.shared_scratchpad.collision_mgr.bounding_volumes.picker, this.shared_scratchpad.target_item);
            var picker_dest_colliding = this.shared_scratchpad.collision_mgr.bounding_volumes.picker && this.shared_scratchpad.target_dest && this.shared_scratchpad.collision_mgr.check_if_colliding_aabb_aabb(this.shared_scratchpad.collision_mgr.bounding_volumes.picker, this.shared_scratchpad.target_dest);

            if(!this.shared_scratchpad.target_item_picked_up && picker_item_colliding) {
              model_transform = mult(this.shared_scratchpad.target_item.transform, translation(0, -2, 0));
              model_transform = mult(model_transform, rotation(90, [0, 1, 0]));
              model_transform = mult(model_transform, rotation(-80, [1, 0, 0]));

              // console.log("x, y, z scale: " + this.shared_scratchpad.target_item.transform[0][0] + ", " + this.shared_scratchpad.target_item.transform[1][1] + ", " + this.shared_scratchpad.target_item.transform[2][2]);
              // model_transform = mult(model_transform, scale(1/(this.shared_scratchpad.target_item.transform[0][0] > 0 ? this.shared_scratchpad.target_item.transform[0][0] : 1), 1/this.shared_scratchpad.target_item.transform[1][1], 1/this.shared_scratchpad.target_item.transform[2][2]))
            } 
            // else if(this.shared_scratchpad.target_item_picked_up && picker_dest_colliding) {
            //   model_transform = mult(this.shared_scratchpad.target_dest.transform, translation(0, 2, 0));
            //   model_transform = mult(model_transform, rotation(90, [0, 1, 0]));
            //   model_transform = mult(model_transform, rotation(-80, [1, 0, 0]));
            // } 
            else if (this.shared_scratchpad.collision_mgr.bounding_volumes.picker) {
              // model_transform = mult(this.shared_scratchpad.collision_mgr.bounding_volumes.picker.transform, translation(0, -30, 0));
              model_transform = mult(inverse(this.graphics_state.camera_transform), translation(0, -4, -30));
              model_transform = mult(model_transform, rotation(70, [1, 0, 0]));
              model_transform = mult(model_transform, scale(0.5, 0.5, 0.5));
            }
            

            shapes_in_use.circle.draw(this.shared_scratchpad.graphics_state, model_transform, this.materials.lightBlue);
          }
      }
  }, Animation );

Declare_Any_Class( "Example_Animation",  // An example of a displayable object that our class Canvas_Manager can manage.  This one draws the scene's 3D shapes.
  { 'construct': function( context )
      { this.shared_scratchpad    = context.shared_scratchpad;
        this.context = context;

        // this.shared_scratchpad.collision_mgr = new Collision_Manager();
        this.shared_scratchpad.draw_aabb = false;
        this.goals = [{"bruin_card": "swipe_token"}, {"invite": "dinner_strangers"}, {"tag": "folder"}];
        // this.shared_scratchpad.current_goal_reached = true;
        this.shared_scratchpad.goal_set = false;

        this.camera_angle = 0;
        this.prev_time = 0;

        this.color_array = [ Color( 255/255, 0/255, 0/255, 1 ),      // Red
                            Color( 255/255, 128/255, 0/255, 1 ),    // Orange
                            Color( 255/255, 255/255, 0/255, 1 ),    // Yellow
                            Color( 0/255, 255/255, 0/255, 1 ),      // Green
                            Color( 0/255, 0/255, 255/255, 1 ),      // Blue
                            Color( 75/255, 0/255, 130/255, 1 ),     // Indigo
                            Color( 148/255, 0/255, 211/255, 1 ) ];   // Violet
        this.color_trans = 0;

        // context.register_display_object("bruin_card", new Bruin_Card(context));

        shapes_in_use.triangle        = new Triangle();                  // At the beginning of our program, instantiate all shapes we plan to use,
        shapes_in_use.strip           = new Square();                   // each with only one instance in the graphics card's memory.
        shapes_in_use.bad_tetrahedron = new Tetrahedron( false );      // For example we'll only create one "cube" blueprint in the GPU, but we'll re-use
        shapes_in_use.tetrahedron     = new Tetrahedron( true );      // it many times per call to display to get multiple cubes in the scene.
        shapes_in_use.windmill        = new Windmill( 10 );
        shapes_in_use.sphere1         = new Sphere(15, 15, 1);
        shapes_in_use.square          = new Square();
        shapes_in_use.cube            = new Cube();
        shapes_in_use.cone_tip        = new Cone_Tip(3, 10);

        shapes_in_use.triangle_flat        = Triangle.prototype.auto_flat_shaded_version();
        shapes_in_use.strip_flat           = Square.prototype.auto_flat_shaded_version();
        shapes_in_use.bad_tetrahedron_flat = Tetrahedron.prototype.auto_flat_shaded_version( false );
        shapes_in_use.tetrahedron_flat          = Tetrahedron.prototype.auto_flat_shaded_version( true );
        shapes_in_use.windmill_flat             = Windmill.prototype.auto_flat_shaded_version( 10 );
        shapes_in_use.sphere1_flat = Sphere.prototype.auto_flat_shaded_version( 15, 15, 1 );
        shapes_in_use.particles       = new Particles(25, this.goals.length);


        shapes_in_use.phone = new Shape_From_File("Common/models/phone/Smartphone.obj");
        shapes_in_use.vader = new Shape_From_File("Common/models/vader/LegoDarthVaderHelmet.obj");

        // environment
        shapes_in_use.ground = new Regular_2D_Polygon(36, 36);
        shapes_in_use.tree1_leaves = new Rounded_Closed_Cone(16, 16);
        shapes_in_use.trunk = new Capped_Cylinder(16, 16);
        shapes_in_use.box = new Cube();
        shapes_in_use.tree2_leaves1 = new Sphere(15, 15, 1);
        shapes_in_use.tree2_leaves2 = new Torus(15, 15);

        textures_in_use.vader = new Texture("Common/textures/DarthVaderTexture.jpg", true);
        
        // environment
        textures_in_use.grass = new Texture("Common/textures/grass.png", false);
        textures_in_use.skyside = new Texture("Common/textures/skyside.png", false);
        textures_in_use.skytop = new Texture("Common/textures/skytop.png", false);

// console.log(gl.getParameter(gl.CULL_FACE_MODE));
// console.log(gl.FRONT_AND_BACK + ", " + gl.FRONT + ", " + gl.BACK);
        var texture_dir = "Common/textures/";
        textures_in_use.earth = new Texture(texture_dir + "earth.gif", false);
        textures_in_use.noodles = new Texture(texture_dir + "noodles.jpg", false);
        textures_in_use.tenerife = new Texture(texture_dir + "tenerife.jpg", false);

        this.generate_scene();
      },
    'init_keys': function( controls )   // init_keys():  Define any extra keyboard shortcuts here
      {
        this.controls = controls;
        // controls.add( "ALT+a", this, function() { this.shared_scratchpad.animate                      ^= 1; console.log(this.shared_scratchpad.animate); } );
        // controls.add("m", this, function() {this.shared_scratchpad.all_goals_reached ^= 1;});
      },
    'update_strings': function( user_interface_string_manager )       // Strings that this displayable object (Animation) contributes to the UI:
      {
        user_interface_string_manager.string_map["time"]    = "Animation Time: " + Math.round( this.shared_scratchpad.graphics_state.animation_time )/1000 + "s";
        user_interface_string_manager.string_map["animate"] = "Animation " + (this.shared_scratchpad.animate ? "on" : "off") ;
      },
    'generate_scene': function() {
      this.scene_geom_transforms = [];
      this.scene_geom_mats = [];

      for(var i = 0; i < 360; i+= 5) {
        // model_transform = mat4();
        var cam = this.shared_scratchpad.graphics_state.camera_transform;
        cam = mult(cam, rotation(i, 0, 1, 0));
        cam = mult(cam, translation(0, 0, -45));
        cam = mult(cam, rotation(-90, 1, 0, 0));
        cam = mult(cam, scale(Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 11) + 3, Math.floor(Math.random() * 5) + 1));
        this.scene_geom_transforms.push(cam);

        this.scene_geom_mats.push(new Material(Color(Math.floor(Math.random() * 256)/255, Math.floor(Math.random() * 256)/255, Math.floor(Math.random() * 256)/255), .4, .2, .2, 40));
      }
    },
    'check_goals': function() {
      var col_mgr = this.shared_scratchpad.collision_mgr;

      if(!this.shared_scratchpad.all_goals_reached) {
        this.shared_scratchpad.current_goal_reached = this.shared_scratchpad.target_item_picked_up && col_mgr.check_if_colliding_aabb_aabb(col_mgr.bounding_volumes.char, this.shared_scratchpad.target_dest);

        if(!this.shared_scratchpad.goal_set) {
          this.context.register_display_object(Object.keys(this.goals[0])[0], new displayables[Object.keys(this.goals[0])[0]](this.context));
          this.context.register_display_object(this.goals[0][Object.keys(this.goals[0])[0]], new displayables[this.goals[0][Object.keys(this.goals[0])[0]]](this.context));

          new AABB([{ positions: [vec3(0, 0, 0), vec3(0, 0, 0)] }], [mat4()], col_mgr, Object.keys(this.goals[0])[0]);
          new AABB([{ positions: [vec3(0, 0, 0), vec3(0, 0, 0)] }], [mat4()], col_mgr, this.goals[0][Object.keys(this.goals[0])[0]]);

          this.shared_scratchpad.goal_set = true;
        }



        if(this.shared_scratchpad.current_goal_reached) {
          col_mgr.unregister_bounding_volume(Object.keys(this.goals[0])[0]);
          col_mgr.unregister_bounding_volume(this.goals[0][Object.keys(this.goals[0])[0]]);

          this.context.unregister_display_object(Object.keys(this.goals[0])[0]);
          this.context.unregister_display_object(this.goals[0][Object.keys(this.goals[0])[0]]);

          this.goals.shift();

          if(this.goals.length > 0) {
            this.shared_scratchpad.goal_set = false;
            this.shared_scratchpad.target_item_picked_up = false;
          } else {
            this.shared_scratchpad.all_goals_reached = true;
          }
        } else {


        this.shared_scratchpad.target_item = col_mgr.bounding_volumes[Object.keys(this.goals[0])[0]];
        this.shared_scratchpad.target_dest = col_mgr.bounding_volumes[this.goals[0][Object.keys(this.goals[0])[0]]];
        }
      }
    },
    'display': function(time)
      {
        resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.BLEND);

        var graphics_state  = this.shared_scratchpad.graphics_state,
            model_transform = mat4();             // We have to reset model_transform every frame, so that as each begins, our basis starts as the identity.
        shaders_in_use[ "Default" ].activate();

        // *** Lights: *** Values of vector or point lights over time.  Arguments to construct a Light(): position or vector (homogeneous coordinates), color, size
        // If you want more than two lights, you're going to need to increase a number in the vertex shader file (index.html).  For some reason this won't work in Firefox.
        graphics_state.lights = [];                    // First clear the light list each frame so we can replace & update lights.

        var t = graphics_state.animation_time/1000, light_orbit = [ Math.cos(t), Math.sin(t) ];
        graphics_state.lights.push( new Light( vec4(  3,  4,  0, 1 ), Color( 240/255, 240/255, 240/255, 1 ), 100000 ) );

        // *** Materials: *** Declare new ones as temps when needed; they're just cheap wrappers for some numbers.
        // 1st parameter:  Color (4 floats in RGBA format), 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 5th: Smoothness exponent, 6th: Texture image.
        // Omit the final (string) parameter if you want no texture

        var   brightRed = new Material( Color(240/255, 81/255, 54/255, 1), .8, .8, .4, 40),
              icyGrey = new Material( Color(187/255, 188/255, 188/255, 1), .4, .8, .4, 40),
              blueGreen = new Material( Color(64/255, 193/255, 172/255, 1), .2, .6, .8, 40),
              lightBlue = new Material( Color(116/255, 209/255, 234/255, 1), .2, .6, .8, 40),
              brownOrange = new Material( Color(189/255, 100/255, 57/255), .6, .6, .2, 40),
              yellow = new Material( Color(255/255, 236/255, 45/255, 1), .4, .6, .8, 40),
              white = new Material(Color(255/255, 255/255, 255/255, 1), .4, .3, .2, 40),
              grass = new Material(Color(172 / 255, 193 / 255, 172 / 255, 1), .6, .6, .2, 40, "grass"),
              skyside = new Material(Color(116 / 255, 209 / 255, 234 / 255, 1), 0.5, 1, 1, 40, "skyside"),
              skytop = new Material(Color(116 / 255, 209 / 255, 234 / 255, 1), 0.5, 1, 1, 40, "skytop"),

              treeGreen1 = new Material(Color(28 / 255, 213 / 255, 15 / 255, 1), .5, 1, .8, 40),
              treeGreen2 = new Material(Color(0 / 255, 153 / 255, 18 / 255, 1), .5, 1, .8, 40),
              treeGreen3 = new Material(Color(0 / 255, 105 / 255, 12 / 255, 1), .5, 1, .8, 40),
              treeTrunk = new Material(Color(88 / 255, 49 / 255, 13 / 255), .5, 1, 0.2, 40),
              particle_material = new Material( Color(240/255, 81/255, 54/255, 1), .8, .8, .4, 40, "fuzz.png" );


        /**********************************
        Start coding down here!!!!
        **********************************/                                     // From here on down it's just some example shapes drawn for you -- replace them with your own!

        var delta = time - (this.prev_time === 0 ? time : this.prev_time);
        this.prev_time = time;
        this.color_trans = (this.color_trans + delta/1000) % 7;

        


        var model_transform_stack = [];

        this.check_goals();


        // shapes_in_use.cube.draw(graphics_state, mult(this.shared_scratchpad.camera_origin, translation(0, -3, 0)), brownOrange);

        //ground
        ground_MT = mult(model_transform, rotation(90, vec3(1, 0, 0)));
        ground_MT = mult(ground_MT, translation(0, 0, 4.5));
        ground_MT = mult(ground_MT, scale(90, 90, 90));
        
        shapes_in_use.ground.draw(graphics_state, ground_MT, grass);



        tree1_posArr =
            [
                  vec2(-40, 10),
                  vec2(-45, 20),
                  vec2(-30, 30),
                  vec2(-40, 20),
                  vec2(0, -60),
                  vec2(-55, 10),
                  vec2(-35, 50),
                  vec2(45, 50),
                  vec2(-40, 30),
                  vec2(-40, -15),
                  vec2(-50, -30),
                  vec2(-50, 0),
                  vec2(35, 35),
                  vec2(-55, -15),
                  vec2(-65, -10),
                  vec2(-55, -30),
                  vec2(25, 35)


            ];


        ///cone trees///
        tree1_MT = mult(model_transform, rotation(270, vec3(1, 0, 0)));

        for (var i = 0; i < 17; i++)
        {
            tree1leaves1_MT = mult(tree1_MT, translation(tree1_posArr[i][0], tree1_posArr[i][1], 14 - i * 0.25));
            tree1leaves1_MT = mult(tree1leaves1_MT, scale(4.5, 4.5, 6.0 - i * 0.25));
            shapes_in_use.tree1_leaves.draw(graphics_state, tree1leaves1_MT, treeGreen1);

            tree1leaves2_MT = mult(tree1_MT, translation(tree1_posArr[i][0], tree1_posArr[i][1], 12 - i * 0.25));
            tree1leaves2_MT = mult(tree1leaves2_MT, scale(5.5, 5.5, 8 - i * 0.25));
            shapes_in_use.tree1_leaves.draw(graphics_state, tree1leaves2_MT, treeGreen2);

            tree1leaves3_MT = mult(tree1_MT, translation(tree1_posArr[i][0], tree1_posArr[i][1], 8 - i * 0.25));
            tree1leaves3_MT = mult(tree1leaves3_MT, scale(6.5, 6.5, 9 - i * 0.25));
            shapes_in_use.tree1_leaves.draw(graphics_state, tree1leaves3_MT, treeGreen3);

            tree1trunk_MT = mult(tree1_MT, translation(tree1_posArr[i][0], tree1_posArr[i][1], -2.5 ));
            tree1trunk_MT = mult(tree1trunk_MT, scale(2 - i * 0.05, 2 - i * 0.05, 9));
            shapes_in_use.trunk.draw(graphics_state, tree1trunk_MT, treeTrunk);
        }

        ///round trees///

        tree2_posArr =
            [
                  vec2(40, 10),
                  vec2(45, 20),
                  vec2(65, 7),
                  vec2(35, 25),
                  vec2(50, 45),

                  vec2(60, 35),
                  vec2(45, 0),
                  vec2(10, -70),
                  vec2(20, -60),
                  vec2(35, -40),

                  vec2(25, -70),
                  vec2(35, -50),
                  vec2(30, -60),
                  vec2(60, 10),
                  vec2(40, 10)
            ];

        tree2_MT = mult(model_transform, rotation(270, vec3(1, 0, 0)));

        for (var i = 0; i < 15; i++) {

            tree2leaves1_MT = mult(tree2_MT, translation(tree2_posArr[i][0] - 0.2, tree2_posArr[i][1], 9 - i*0.05));
            tree2leaves1_MT = mult(tree2leaves1_MT, scale(6.5, 6.5, 7.0 - i * 0.07));
            shapes_in_use.tree2_leaves1.draw(graphics_state, tree2leaves1_MT, treeGreen2);

            tree2leaves2_MT = mult(tree2_MT, translation(tree2_posArr[i][0] + 0.2, tree2_posArr[i][1], 9.5 - i * 0.05));
            tree2leaves2_MT = mult(tree2leaves2_MT, scale(3.0, 3.0, 3.0 - i * 0.07));
            shapes_in_use.tree2_leaves2.draw(graphics_state, tree2leaves2_MT, treeGreen2);

            tree2leaves3_MT = mult(tree2_MT, translation(tree2_posArr[i][0] - 0.2, tree2_posArr[i][1], 7.9 - i * 0.05));
            tree2leaves3_MT = mult(tree2leaves3_MT, scale(2.7, 2.7, 3.0 - i * 0.07));
            shapes_in_use.tree2_leaves2.draw(graphics_state, tree2leaves3_MT, treeGreen3);

            tree2leaves4_MT = mult(tree2_MT, translation(tree2_posArr[i][0], tree2_posArr[i][1], 6 - i * 0.05));
            tree2leaves4_MT = mult(tree2leaves4_MT, scale(2.0, 2.0, 4.0 - i * 0.07));
            shapes_in_use.tree2_leaves2.draw(graphics_state, tree2leaves4_MT, treeGreen3);

            tree2trunk_MT = mult(tree2_MT, translation(tree2_posArr[i][0], tree2_posArr[i][1], -1.0));
            tree2trunk_MT = mult(tree2trunk_MT, scale(1.3 + i * 0.05, 1.3 + i * 0.05, 10));
            shapes_in_use.trunk.draw(graphics_state, tree2trunk_MT, treeTrunk);

        }

        ///sky///
        skybox_MT = mult(model_transform, translation(0, 60, 0));
        skybox_MT = mult(skybox_MT, scale(75, 75, 75));
        shapes_in_use.box.draw(graphics_state, skybox_MT, skyside);

        skytop_MT = mult(model_transform, rotation(270, vec3(1, 0, 0)));
        skytop_MT = mult(skytop_MT, translation(0, 0, 129.9));
        skytop_MT = mult(skytop_MT, scale(75, 75, 1));
        shapes_in_use.strip.draw(graphics_state, skytop_MT, skytop);


        ///Royce///

        var light = graphics_state.lights.pop();
        if(this.color_trans < 1) {
          graphics_state.lights.push(new Light( vec4(  0,  1,  70,  1 ), LerpRGB( this.color_array[0], this.color_array[1], this.color_trans % 1), 10000000) );
        } 
        else if ( this.color_trans < 2 ) {
          graphics_state.lights.push(new Light( vec4(  0,  1,  70,  1 ), LerpRGB( this.color_array[1], this.color_array[2], this.color_trans % 1), 10000000) );
        }
        else if ( this.color_trans < 3 ) {
          graphics_state.lights.push(new Light( vec4(  0,  1,  70,  1 ), LerpRGB( this.color_array[2], this.color_array[3], this.color_trans % 1), 10000000) );
        } 
        else if ( this.color_trans < 4 ) {
          graphics_state.lights.push(new Light( vec4(  0,  1,  70,  1 ), LerpRGB( this.color_array[3], this.color_array[4], this.color_trans % 1), 10000000) );
        } 
        else if ( this.color_trans < 5 ) {
          graphics_state.lights.push(new Light( vec4(  0,  1,  70,  1 ), LerpRGB( this.color_array[4], this.color_array[5], this.color_trans % 1), 10000000) );
        } 
        else if ( this.color_trans < 6 ) {
          graphics_state.lights.push(new Light( vec4(  0,  1,  70,  1 ), LerpRGB( this.color_array[5], this.color_array[6], this.color_trans % 1), 10000000) );
        } 
        else if ( this.color_trans < 7 ) {
          graphics_state.lights.push(new Light( vec4(  0,  1,  70,  1 ), LerpRGB( this.color_array[6], this.color_array[0], this.color_trans % 1), 10000000) );
        }

        royce1_MT = mult(model_transform, translation(0, 1.5, -62));
        royce1_MT = mult(royce1_MT, scale(30, 6, 5));
        shapes_in_use.box.draw(graphics_state, royce1_MT, white);

        royce2_MT = mult(model_transform, translation(-13, 7.5, -56.5));
        royce2_MT = mult(royce2_MT, scale(4.2, 12, 3));
        shapes_in_use.box.draw(graphics_state, royce2_MT, white);

        royce3_MT = mult(model_transform, translation(13, 7.5, -56.5));
        royce3_MT = mult(royce3_MT, scale(4.2, 12, 3));
        shapes_in_use.box.draw(graphics_state, royce3_MT, white);

        royce4_MT = mult(model_transform, translation(0, 2.5, -64));
        royce4_MT = mult(royce4_MT, scale(8.9, 7, 10));
        shapes_in_use.box.draw(graphics_state, royce4_MT, white);

        royce5_MT = mult(model_transform, translation(0, 9.5, -54));
        royce5_MT = mult(royce5_MT, scale(8.6, 3, 1));
        royce6_MT = mult(royce5_MT, scale(-1, 1, 1));
        shapes_in_use.triangle.draw(graphics_state, royce5_MT, white);
        shapes_in_use.triangle.draw(graphics_state, royce6_MT, white);

        royce7_MT = mult(model_transform, translation(0, 9.5, -74));
        royce7_MT = mult(royce7_MT, scale(8.6, 3, 1));
        royce8_MT = mult(royce7_MT, scale(-1, 1, 1));
        shapes_in_use.triangle.draw(graphics_state, royce7_MT, white);
        shapes_in_use.triangle.draw(graphics_state, royce8_MT, white);

        royce9_MT = mult(model_transform, rotation(71, vec3(0, 0, 1)));
        royce9_MT = mult(royce9_MT, rotation(90, vec3(0, 1, 0)));
        royce9_MT = mult(royce9_MT, translation(64.05, -1, 11.9));
        royce9_MT = mult(royce9_MT, scale(9.9, 5.2, 1));
        shapes_in_use.strip.draw(graphics_state, royce9_MT, white);

        royce10_MT = mult(model_transform, rotation(-71, vec3(0, 0, 1)));
        royce10_MT = mult(royce10_MT, rotation(90, vec3(0, 1, 0)));
        royce10_MT = mult(royce10_MT, translation(64.05, -1, -11.9));
        royce10_MT = mult(royce10_MT, scale(9.9, 5.2, 1));
        shapes_in_use.strip.draw(graphics_state, royce10_MT, white);

        graphics_state.lights.pop();
        graphics_state.lights.push(light);

        ///Boelter glass///
        boelter4_MT = mult(model_transform, translation(51, 0, 21.5));
        boelter4_MT = mult(boelter4_MT, rotation(270, vec3(1, 0, 0)));
        boelter4_MT = mult(boelter4_MT, rotation(250, vec3(0, 0, 1)));
        boelter4_MT = mult(boelter4_MT, scale(20, 1, 17));
        shapes_in_use.box.draw(graphics_state, boelter4_MT, lightBlue);


        //
        //  PARTICLES_DRAW_BEGIN
        //

        // gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.disable(gl.DEPTH_TEST);

        model_transform_stack.push(mat4());
        for (var i = 1; i < 13; i++) {
            model_transform_stack[i] = mult(model_transform_stack[i - 1], rotation( 360 / 13, 0, 1, 0 ));
        }

        shaders_in_use["Particle_Shader"].activate();
        for (var i = 0; i < 13; i++) {
            model_transform = mult(model_transform_stack[i], translation(0, 0, 30));
            model_transform = mult(model_transform, scale(2, 2, 2));
            shapes_in_use.particles.draw( graphics_state, model_transform, particle_material, this.goals.length );
        }

        // gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
        gl.blendFunc(gl.ONE, gl.ZERO);

        //
        //  PARTICLES_DRAW_END
        //


        if(this.shared_scratchpad.draw_aabb) {
          // console.log('draw aabb');
          shaders_in_use[ "Simple_Shader" ].activate();

          this.shared_scratchpad.collision_mgr.draw_bounding_volumes(graphics_state, shaders_in_use[ "Simple_Shader" ]);
        }

        if(this.shared_scratchpad.all_goals_reached) {


          if(!this.cap_added) {
            document.getElementById("audio").src = "music.mp3";
            this.context.register_display_object("cap", new Cap(this.context));
            this.cap_added = true;
          }

          if(this.camera_angle < 90) {
            // delta = time - (this.prev_time === 0 ? time : this.prev_time);
            this.prev_time = time;
            var rate = (15 * delta)/750;
            this.camera_angle += rate;

            this.shared_scratchpad.graphics_state.camera_transform = mult(rotation(-rate, [1, 0, 0]), this.shared_scratchpad.graphics_state.camera_transform);
          } else if(!this.vader_control_added) {
            this.controls.add("s", this, function() { 
              this.context.register_display_object("phone", new Phone(this.context));
              // var handle = setInterval(function(self) {
              //   self.context.register_display_object("vader", new Darth_Vader(self.context));
              //   var audio = new Audio("vader_breath.mp3");
              //   audio.play();
              //   // var innerHandle = setInterval(function() {
                  
              //   // }, 2000);

              //   clearInterval(handle);
              // }, 1000, this);
              this.controls.remove("s");
            }, {'type':'keyup'});
            this.vader_control_added = true;
          }
        } else {
          // this.context.unregister_display_object("cap");
          this.cap_added = false;
          // this.prev_time = 0;
          // this.camera_angle = 0;
        }
      }
  }, Animation );

function LerpRGB (a, b, t)      // Color Interpolation function
{
  return new Color
  (
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
    a[3] + (b[3] - a[3]) * t
  );
}