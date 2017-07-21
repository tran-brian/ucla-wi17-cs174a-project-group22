// UCLA's Graphics Example Code (Javascript and C++ translations available), by Garett Ridge for CS174a.
// example_shapes.js is where you can define a number of objects that inherit from class Shape.  All Shapes have certain arrays.  These each manage either
// the shape's 3D vertex positions, 3D vertex normal vectors, 2D texture coordinates, or any other per-vertex quantity.  All subclasses of Shape inherit
// instantiation, any Shape subclass populates these lists in their own way, so we can use GL calls -- special kernel functions to copy each of the lists
// one-to-one into new buffers in the graphics card's memory.

// 1.  Some example simple primitives -- really easy shapes are at the beginning of the list just to demonstrate how Shape is used. Mimic these when
//                        making your own Shapes.  You'll find it to be much easier to work with than raw GL vertex arrays managed on your own.
//     Tutorial shapes:   Triangle, Square, Tetrahedron, Windmill,
//
// 2.  More difficult primitives*:  Surface_of_Revolution, Regular_2D_Polygon, Cylindrical_Tube, Cone_Tip, Torus, Sphere, Subdivision_Sphere,
//                                 OBJ file (loaded using the library webgl-obj-loader.js )
//        *I'll give out the code for these later.
// 3.  Example compound shapes*:    Closed_Cone, Capped_Cylinder, Cube, Axis_Arrows, Text_Line
//        *I'll give out the code for these later.  Except for Text_Line, which you can already have below.
// *******************************************************

// 1.  TUTORIAL SHAPES:     ------------------------------------------------------------------------------------------------------------------------------

// *********** TRIANGLE ***********
Declare_Any_Class( "Triangle",    // First, the simplest possible Shape – one triangle.  It has 3 vertices, each having their own 3D position, normal
  { 'populate': function()        // vector, and texture-space coordinate.
      {
         this.positions      = [ vec3(0,0,0), vec3(1,0,0), vec3(0,1,0) ];   // Specify the 3 vertices -- the point cloud that our Triangle needs.
         this.normals        = [ vec3(0,0,1), vec3(0,0,1), vec3(0,0,1) ];   // ...
         this.texture_coords = [ vec2(0,0),   vec2(1,0),   vec2(0,1)   ];   // ...
         this.indices        = [ 0, 1, 2 ];                                 // Index into our vertices to connect them into a whole Triangle.
      }
  }, Shape )

// *********** SQUARE ***********
Declare_Any_Class( "Square",    // A square, demonstrating shared vertices.  On any planar surface, the interior edges don't make any important seams.
  { 'populate': function()      // In these cases there's no reason not to re-use values of the common vertices between triangles.  This makes all the
      {                         // vertex arrays (position, normals, etc) smaller and more cache friendly.
         this.positions     .push( vec3(-1,-1,0), vec3(1,-1,0), vec3(-1,1,0), vec3(1,1,0) ); // Specify the 4 vertices -- the point cloud that our Square needs.
         this.normals       .push( vec3(0,0,1), vec3(0,0,1), vec3(0,0,1), vec3(0,0,1) );     // ...
         this.texture_coords.push( vec2(0,0),   vec2(1,0),   vec2(0,1),   vec2(1,1)   );     // ...
         this.indices       .push( 0, 1, 2,     1, 3, 2 );                                   // Two triangles this time, indexing into four distinct vertices.
      }
  }, Shape )

// *********** TETRAHEDRON ***********
Declare_Any_Class( "Tetrahedron",              // A demo of flat vs smooth shading.  Also our first 3D, non-planar shape.
  { 'populate': function( using_flat_shading ) // Takes a boolean argument
      {
        var a = 1/Math.sqrt(3);

        if( !using_flat_shading )                                                 // Method 1:  A tetrahedron with shared vertices.  Compact, performs
        {                                                                 // better, but can't produce flat shading or discontinuous seams in textures.
            this.positions     .push( vec3(0,0,0),    vec3(1,0,0), vec3(0,1,0), vec3(0,0,1) );
            this.normals       .push( vec3(-a,-a,-a), vec3(1,0,0), vec3(0,1,0), vec3(0,0,1) );
            this.texture_coords.push( vec2(0,0),      vec2(1,0),   vec2(0,1),   vec2(1,1)   );
            this.indices.push( 0, 1, 2,   0, 1, 3,   0, 2, 3,    1, 2, 3 );                     // Vertices are shared multiple times with this method.
        }
        else
        { this.positions.push( vec3(0,0,0), vec3(1,0,0), vec3(0,1,0) );         // Method 2:  A tetrahedron with four independent triangles.
          this.positions.push( vec3(0,0,0), vec3(1,0,0), vec3(0,0,1) );
          this.positions.push( vec3(0,0,0), vec3(0,1,0), vec3(0,0,1) );
          this.positions.push( vec3(0,0,1), vec3(1,0,0), vec3(0,1,0) );

          this.normals.push( vec3(0,0,-1), vec3(0,0,-1), vec3(0,0,-1) );           // Here's where you can tell Method 2 is flat shaded, since
          this.normals.push( vec3(0,-1,0), vec3(0,-1,0), vec3(0,-1,0) );           // each triangle gets a single unique normal value.
          this.normals.push( vec3(-1,0,0), vec3(-1,0,0), vec3(-1,0,0) );
          this.normals.push( vec3( a,a,a), vec3( a,a,a), vec3( a,a,a) );

          this.texture_coords.push( vec3(0,0,0), vec3(1,0,0), vec3(0,1,0) );    // Each face in Method 2 also gets its own set of texture coords
          this.texture_coords.push( vec3(0,0,0), vec3(1,0,0), vec3(0,1,0) );    //(half the image is mapped onto each face).  We couldn't do this
          this.texture_coords.push( vec3(0,0,0), vec3(1,0,0), vec3(0,1,0) );    // with shared vertices -- after all, it involves different results
          this.texture_coords.push( vec3(0,0,0), vec3(1,0,0), vec3(0,1,0) );    // when approaching the same point from different directions.

          this.indices.push( 0, 1, 2,    3, 4, 5,    6, 7, 8,    9, 10, 11 );      // Notice all vertices are unique this time.
        }
      }
  }, Shape )

// *********** CUBE ***********
Declare_Any_Class( "MyCube",
{
  'vertices': null,
  'texCoords': null,
  'quad': function quad(a, b, c, d)
  {
    this.positions.push(this.vertices[a], this.vertices[b], this.vertices[c], this.vertices[d]);
  },
  'createSidePanels': function() {
    this.quad( 1, 0, 3, 2 ); // back
    this.quad( 2, 3, 7, 6 ); // right
    this.quad( 3, 0, 4, 7 ); // bottom
    this.quad( 6, 5, 1, 2 ); // top
    this.quad( 4, 5, 6, 7 ); // front
    this.quad( 5, 4, 0, 1 ); // left
  },
  'createNormals': function() {
    this.normals.push( vec3(0,0,1),  vec3(0,0,1),  vec3(0,0,1),  vec3(0,0,1) );
    this.normals.push( vec3(1,0,0),  vec3(1,0,0),  vec3(1,0,0),  vec3(1,0,0) );
    this.normals.push( vec3(0,-1,0), vec3(0,-1,0), vec3(0,-1,0), vec3(0,-1,0) );
    this.normals.push( vec3(0,1,1),  vec3(0,1,0),  vec3(0,1,0),  vec3(0,1,0) );
    this.normals.push( vec3(0,0,-1), vec3(0,0,-1), vec3(0,0,-1), vec3(0,0,-1) );
    this.normals.push( vec3(-1,0,0), vec3(-1,0,0), vec3(-1,0,0), vec3(-1,0,0) );
  },
  'createTextureCoords': function(texCoordMax = 1) {
    var texCoords = [
      vec2(0, 0),
      vec2(0, texCoordMax),
      vec2(texCoordMax, texCoordMax),
      vec2(texCoordMax, 0)
    ];

    this.texture_coords.push(texCoords[1], texCoords[0], texCoords[3], texCoords[2]);  // front
    this.texture_coords.push(texCoords[1], texCoords[0], texCoords[3], texCoords[2]);  // right
    this.texture_coords.push(texCoords[0], texCoords[3], texCoords[2], texCoords[1]);  // bottom
    this.texture_coords.push(texCoords[2], texCoords[1], texCoords[0], texCoords[3]);  // top
    this.texture_coords.push(texCoords[3], texCoords[2], texCoords[1], texCoords[0]);  // back
    this.texture_coords.push(texCoords[1], texCoords[0], texCoords[3], texCoords[2]);  // left
  },
  'populate': function(texCoordMax = 1) {
    var size = 0.5;
    this.vertices = [
      vec3( -size, -size,  size ),
      vec3( -size,  size,  size ),
      vec3(  size,  size,  size ),
      vec3(  size, -size,  size ),
      vec3( -size, -size, -size ),
      vec3( -size,  size, -size ),
      vec3(  size,  size, -size ),
      vec3(  size, -size, -size )
    ];

    this.createSidePanels();
    this.createNormals();
    this.createTextureCoords(texCoordMax);
    this.indices.push(
      0,1,2,     0,3,2,
      4,5,6,     4,7,6,
      8,9,10,    8,11,10,
      12,13,14,  12,15,14,
      16,17,18,  16,19,18,
      20,21,22,  20,23,22
    );
  }
}, Shape)

// // *********** SPHERE ***********
// Declare_Any_Class( "Sphere",
//   {
//     'populate': function(latitudeBands, longitudeBands, radius, using_flat_shading) {
//       for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
//         var theta = latNumber * Math.PI / latitudeBands;
//         var sinTheta = Math.sin(theta);
//         var cosTheta = Math.cos(theta);

//         for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
//           var phi = longNumber * 2 * Math.PI / longitudeBands;
//           var sinPhi = Math.sin(phi);
//           var cosPhi = Math.cos(phi);

//           var x = cosPhi * sinTheta;
//           var y = cosTheta;
//           var z = sinPhi * sinTheta;
//           var u = 1 - (longNumber / longitudeBands);
//           var v = 1 - (latNumber / latitudeBands);

//           this.positions.push(vec3(radius * x, radius * y, radius * z));
//           this.normals.push(vec3(x, y, z));
//           this.texture_coords.push(vec2(u, v));
//         }
//       }

//       for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
//         for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
//           var first = (latNumber * (longitudeBands + 1)) + longNumber;
//           var second = first + longitudeBands + 1;
//           this.indices.push(first);
//           this.indices.push(second);
//           this.indices.push(first + 1);

//           this.indices.push(second);
//           this.indices.push(second + 1);
//           this.indices.push(first + 1);
//         }
//       }
//     }
//   }, Shape )

// *********** WINDMILL ***********
Declare_Any_Class( "Windmill",          // As our shapes get more complicated, we begin using matrices and flow control (including loops) to
  { 'populate': function( num_blades )  // generate non-trivial point clouds and connect them.
      {
          for( var i = 0; i < num_blades; i++ )     // A loop to automatically generate the triangles.
          {
              var spin = rotation( i * 360/num_blades, 0, 1, 0 );             // Rotate around a few degrees in XZ plane to place each new point.
              var newPoint  = mult_vec( spin, vec4( 1, 0, 0, 1 ) );           // Apply that XZ rotation matrix to point (1,0,0) of the base triangle.
              this.positions.push( vec3( newPoint[0], 0, newPoint[2] ) );     // Store this XZ position.  This is point 1.
              this.positions.push( vec3( newPoint[0], 1, newPoint[2] ) );     // Store it again but with higher y coord:  This is point 2.
              this.positions.push( vec3( 0, 0, 0 ) );                         // All triangles touch this location.  This is point 3.

              var newNormal = mult_vec( spin, vec4( 0, 0, 1, 0 ) );           // Rotate our base triangle's normal (0,0,1) to get the new one.  Careful!
              this.normals.push( newNormal.slice(0,3) );                      // Normal vectors are not points; their perpendicularity constraint gives them
              this.normals.push( newNormal.slice(0,3) );                      // a mathematical quirk that when applying matrices you have to apply the
              this.normals.push( newNormal.slice(0,3) );                      // transposed inverse of that matrix instead.  But right now we've got a pure
                                                                              // rotation matrix, where the inverse and transpose operations cancel out.
              this.texture_coords.push( vec2( 0, 0 ) );
              this.texture_coords.push( vec2( 0, 1 ) );                       // Repeat the same arbitrary texture coords for each fan blade.
              this.texture_coords.push( vec2( 1, 0 ) );
              this.indices.push ( 3 * i );     this.indices.push ( 3 * i + 1 );        this.indices.push ( 3 * i + 2 ); // Procedurally connect the three
          }                                                                                                             // new vertices into triangles.
      }
  }, Shape )

// 3.  COMPOUND SHAPES, BUILT FROM THE ABOVE HELPER SHAPES      ------------------------------------------------------------------------------------------

Declare_Any_Class( "Text_Line", // Draws a rectangle textured with images of ASCII characters textured over each quad, spelling out a string.
  { 'populate': function( max_size )    // Each quad is a separate rectangle_strip.
      { this.max_size = max_size;
        var object_transform = mat4();
        for( var i = 0; i < max_size; i++ )
        {
          Square.prototype.insert_transformed_copy_into( this, [], object_transform );
          object_transform = mult( object_transform, translation( 1.5, 0, 0 ));
        }
      },
    'draw': function( graphics_state, model_transform, heads_up_display, color )
      { if( heads_up_display )      { gl.disable( gl.DEPTH_TEST );  }
        Shape.prototype.draw.call(this, graphics_state, model_transform, new Material( color, 1, 0, 0, 40, "text.png" ) );
        if( heads_up_display )      { gl.enable(  gl.DEPTH_TEST );  }
      },
    'set_string': function( line )
      { for( var i = 0; i < this.max_size; i++ )
          {
            var row = Math.floor( ( i < line.length ? line.charCodeAt( i ) : ' '.charCodeAt() ) / 16 ),
                col = Math.floor( ( i < line.length ? line.charCodeAt( i ) : ' '.charCodeAt() ) % 16 );

            var skip = 3, size = 32, sizefloor = size - skip;
            var dim = size * 16,  left  = (col * size + skip) / dim,      top    = (row * size + skip) / dim,
                                  right = (col * size + sizefloor) / dim, bottom = (row * size + sizefloor + 5) / dim;

            this.texture_coords[ 4 * i ]     = vec2( left,  1 - bottom );
            this.texture_coords[ 4 * i + 1 ] = vec2( right, 1 - bottom );
            this.texture_coords[ 4 * i + 2 ] = vec2( left,  1 - top );
            this.texture_coords[ 4 * i + 3 ] = vec2( right, 1 - top );
          }
        gl.bindBuffer( gl.ARRAY_BUFFER, this.graphics_card_buffers[2] );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(this.texture_coords), gl.STATIC_DRAW );
      }
  }, Shape )

Declare_Any_Class("Outline",
{
  'populate': function(vertices, indices) {
    this.positions.push(vertices);
    this.indices.push(indices);
  },
  'draw': function() {
    this.index_buffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.index_buffer );
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), gl.STATIC_DRAW);
    gl.drawElements( gl.LINE, this.indices.length, gl.UNSIGNED_INT, 0 );
  }
}, Shape);

Declare_Any_Class( "Shape_From_File",       // A versatile standalone shape that imports all its arrays' data from an
  { populate: function( filename )          // .obj file.  See webgl-obj-loader.js for the rest of the relevant code.
      {
        this.filename = filename;
        this.webGLStart = function(meshes)
          {
            for( var j = 0; j < meshes.mesh.vertices.length/3; j++ )
            {
              this.positions.push( vec3( meshes.mesh.vertices[ 3*j ], meshes.mesh.vertices[ 3*j + 1 ], meshes.mesh.vertices[ 3*j + 2 ] ) );

              this.normals.push( vec3( meshes.mesh.vertexNormals[ 3*j ], meshes.mesh.vertexNormals[ 3*j + 1 ], meshes.mesh.vertexNormals[ 3*j + 2 ] ) );
              this.texture_coords.push( vec2( meshes.mesh.textures[ 2*j ],meshes.mesh.textures[ 2*j + 1 ]  ));
            }
            this.indices  = meshes.mesh.indices;
            this.normalize_positions();
            this.copy_onto_graphics_card();
            this.ready = true;
          }                                                 // Begin downloading the mesh, and once it completes return control to our webGLStart function
        OBJ.downloadMeshes( { 'mesh' : filename }, ( function(self) { return self.webGLStart.bind(self) } ( this ) ) );
      },
    draw: function( graphicsState, model_transform, material )
      { if( this.ready ) Shape.prototype.draw.call(this, graphicsState, model_transform, material );    }
  }, Shape )

  //
//  PARTICLES_CLASS_BEGIN
//

Declare_Any_Class( "Particles",
{ 'populate': function(numParticles, numGoals)
    {
        this.lifetimes = [];
        this.startPositions = [];
        this.endPositions = [];
        this.offsets = [];
        this.offsetsCycle = [
            -1,  1,
            -1, -1,
            1,  1,
            1, -1,
            -1, -1,
            1,  1,
        ];
        this.textureCoordsCycle = [
            0, 1,
            0, 0,
            1, 1,
            1, 0,
            0, 0,
            1, 1,
        ];

         for (var i=0; i < numParticles; i++)  {
             var lifetime = (Math.random() * 5) + 20;
             var startX = (Math.random() * 10) - 5;
             var startY = (Math.random() * 1) + 12;
             var startZ = (Math.random() * 0.25) - 0.125;
             var endX = (Math.random() * 10) - 5;
             var endY = (Math.random() * -5) - 12;
             var endZ = (Math.random() * 2) - 1;
             for (var v=0; v < 6; v++) {
                 this.lifetimes.push(lifetime);

                 this.startPositions.push(startX);
                 this.startPositions.push(startY);
                 this.startPositions.push(startZ);

                 this.endPositions.push(endX);
                 this.endPositions.push(endY);
                 this.endPositions.push(endZ);

                 this.offsets.push(this.offsetsCycle[v * 2]);
                 this.offsets.push(this.offsetsCycle[v * 2 + 1]);

                 this.texture_coords.push(this.textureCoordsCycle[v * 2]);
                 this.texture_coords.push(this.textureCoordsCycle[v * 2 + 1]);
             }
         }

         // gl.enable(gl.BLEND);
         // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

         /**
          * Converts an HSL color value to RGB. Conversion formula
          * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
          * Assumes h, s, l, and a are contained in the set [0, 1] and
          * returns r, g, b, and a in the set [0, 1].
          *
          * @param   {number}  h       The hue
          * @param   {number}  s       The saturation
          * @param   {number}  l       The lightness
          * @param   {number}  a       The opacity
          * @return  {Array}           The RGB representation
          */
         function hslToRgb(h, s, l, a) {
             var r, g, b;

             if(s == 0) {
                 r = g = b = l; // achromatic
             } else {
                 var hue2rgb = function hue2rgb(p, q, t) {
                     if(t < 0) t += 1;
                     if(t > 1) t -= 1;
                     if(t < 1/6) return p + (q - p) * 6 * t;
                     if(t < 1/2) return q;
                     if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                     return p;
                 }

                 var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                 var p = 2 * l - q;
                 r = hue2rgb(p, q, h + 1/3);
                 g = hue2rgb(p, q, h);
                 b = hue2rgb(p, q, h - 1/3);
             }

             return [r, g, b, a];
         }

         this.delta = 0.0;
         this.numGoalsBefore = numGoals;
         this.speed = 1.0;
         this.numParticles = numParticles;
         this.saturation = 0.25;
         this.light = 0.25;
         this.color = hslToRgb(Math.random(), this.saturation, this.light, 0.5);

         var self = this;
         setInterval(function() { self.color = hslToRgb(Math.random(), self.saturation, self.light, 0.5); }, 3000);

         this.particle_buffers = []
         for( var i = 0; i < 5; i++ )      // Memory addresses of the buffers given to this shape in the graphics card.
         { this.particle_buffers.push( gl.createBuffer() );
           gl.bindBuffer(gl.ARRAY_BUFFER, this.particle_buffers[i] );
           switch(i) {
             case 0: gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texture_coords), gl.STATIC_DRAW); break;
             case 1: gl.bufferData(gl.ARRAY_BUFFER, flatten(this.lifetimes), gl.STATIC_DRAW); break;
             case 2: gl.bufferData(gl.ARRAY_BUFFER, flatten(this.startPositions), gl.STATIC_DRAW); break;
             case 3: gl.bufferData(gl.ARRAY_BUFFER, flatten(this.endPositions), gl.STATIC_DRAW); break;
             case 4: gl.bufferData(gl.ARRAY_BUFFER, flatten(this.offsets), gl.STATIC_DRAW); break;  }
         }

       this.positions      = Array(numParticles * 6);
       this.normals        = [ ];
       this.indexed        = false;
   },
    'draw': function(g_state, model_transform, material, numGoalsNow)
    {
        g_addrs.shader_attributes[4].enabled = true;
        g_addrs.shader_attributes[5].enabled = true;
        g_addrs.shader_attributes[6].enabled = true;
        g_addrs.shader_attributes[7].enabled = true;

        this.delta += 0.01;
        if (this.delta > 1000000)
            this.delta = this.delta % 100000;

        if (this.numGoalsBefore != numGoalsNow) {
            this.speed += 1.0;

             for (var i=0; i < 100; i++)  {
                 var lifetime = (Math.random() * 5) + 20;
                 var startX = (Math.random() * 10) - 5;
                 var startY = (Math.random() * 1) + 12;
                 var startZ = (Math.random() * 0.25) - 0.125;
                 var endX = (Math.random() * 10) - 5;
                 var endY = (Math.random() * -5) - 12;
                 var endZ = (Math.random() * 2) - 1;
                 for (var v=0; v < 6; v++) {
                     this.lifetimes.push(lifetime);

                     this.startPositions.push(startX);
                     this.startPositions.push(startY);
                     this.startPositions.push(startZ);

                     this.endPositions.push(endX);
                     this.endPositions.push(endY);
                     this.endPositions.push(endZ);

                     this.offsets.push(this.offsetsCycle[v * 2]);
                     this.offsets.push(this.offsetsCycle[v * 2 + 1]);

                     this.texture_coords.push(this.textureCoordsCycle[v * 2]);
                     this.texture_coords.push(this.textureCoordsCycle[v * 2 + 1]);
                 }
             }

             for( var i = 0; i < 5; i++ )      // Memory addresses of the buffers given to this shape in the graphics card.
             { gl.bindBuffer(gl.ARRAY_BUFFER, this.particle_buffers[i] );
               switch(i) {
                 case 0: gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texture_coords), gl.STATIC_DRAW); break;
                 case 1: gl.bufferData(gl.ARRAY_BUFFER, flatten(this.lifetimes), gl.STATIC_DRAW); break;
                 case 2: gl.bufferData(gl.ARRAY_BUFFER, flatten(this.startPositions), gl.STATIC_DRAW); break;
                 case 3: gl.bufferData(gl.ARRAY_BUFFER, flatten(this.endPositions), gl.STATIC_DRAW); break;
                 case 4: gl.bufferData(gl.ARRAY_BUFFER, flatten(this.offsets), gl.STATIC_DRAW); break;  }
             }

           this.numParticles  += 100;
           this.positions      = Array(this.numParticles * 6);

           this.saturation = (this.saturation <= 0.75) ? this.saturation + 0.25 : 1.0;
           this.light = (this.light <= 0.75) ? this.light + 0.25 : 1.0;

           this.numGoalsBefore = numGoalsNow;
        }

        active_shader.update_uniforms( g_state, model_transform, material, this.color, this.delta, this.speed );                     // vertex list in the GPU we consult.

        if( material.texture_filename )  // Omit the texture string parameter from Material's constructor to signal not to draw a texture.
        { g_addrs.shader_attributes[2].enabled = true;
          if( textures_in_use[ material.texture_filename ] ) gl.bindTexture( gl.TEXTURE_2D, textures_in_use[ material.texture_filename ].id );
        }
        else  { g_addrs.shader_attributes[2].enabled = false; }

        for( var i = 0, j = 0, it = g_addrs.shader_attributes[0]; i < g_addrs.shader_attributes.length, it = g_addrs.shader_attributes[i]; i++ )
        { if (it.index == -1)
            continue;
          if( it.enabled )
          { gl.enableVertexAttribArray( it.index );
            gl.bindBuffer( gl.ARRAY_BUFFER, this.particle_buffers[j] );
            gl.vertexAttribPointer( it.index, it.size, it.type, it.normalized, it.stride, it.pointer );
            j++;
          }
          else  gl.disableVertexAttribArray( it.index );
        }

        gl.drawArrays( gl.TRIANGLES, 0, this.positions.length );   // If no indices were provided, assume the vertices are arranged in triples

        g_addrs.shader_attributes[4].enabled = false;
        g_addrs.shader_attributes[5].enabled = false;
        g_addrs.shader_attributes[6].enabled = false;
        g_addrs.shader_attributes[7].enabled = false;
    }
}, Shape )

//
//  PARTICLES_CLASS_END
//
