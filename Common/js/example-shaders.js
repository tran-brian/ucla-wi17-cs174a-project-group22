// UCLA's Graphics Example Code (Javascript and C++ translations available), by Garett Ridge for CS174a.
// example-shaders.js:  Fill in this file with subclasses of Shader, each of which will store and manage a complete GPU program.

// ******* THE DEFAULT SHADER: Phong Shading Model with Gouraud option *******
Declare_Any_Class( "Phong_or_Gouraud_Shader",
  { 'update_uniforms'          : function( g_state, model_transform, material )     // Send javascrpt's variables to the GPU to update its overall state.
      {
          let [ P, C, M ]  = [ g_state.projection_transform, g_state.camera_transform, model_transform ],   // PCM will mean Projection * Camera * Model
          CM             = mult( C,  M ),
          PCM            = mult( P, CM ),                               // Send the current matrices to the shader.  Go ahead and pre-compute the products
          inv_trans_CM   = toMat3( transpose( inverse( CM ) ) );        // we'll need of the of the three special matrices and just send those, since these
                                                                        // will be the same throughout this draw call & across each instance of the vertex shader.
        gl.uniformMatrix4fv( g_addrs.camera_transform_loc,                  false, flatten(  C  ) );
        gl.uniformMatrix4fv( g_addrs.camera_model_transform_loc,            false, flatten(  CM ) );
        gl.uniformMatrix4fv( g_addrs.projection_camera_model_transform_loc, false, flatten( PCM ) );
        gl.uniformMatrix3fv( g_addrs.camera_model_transform_normal_loc,     false, flatten( inv_trans_CM ) );

        if( g_state.gouraud === undefined ) { g_state.gouraud = g_state.color_normals = false; }    // Keep the flags seen by the shader program
        gl.uniform1i( g_addrs.GOURAUD_loc,         g_state.gouraud      );                          // up-to-date and make sure they are declared.
        gl.uniform1i( g_addrs.COLOR_NORMALS_loc,   g_state.color_normals);

        gl.uniform4fv( g_addrs.shapeColor_loc,     material.color       );    // Send a desired shape-wide color to the graphics card
        gl.uniform1f ( g_addrs.ambient_loc,        material.ambient     );
        gl.uniform1f ( g_addrs.diffusivity_loc,    material.diffusivity );
        gl.uniform1f ( g_addrs.shininess_loc,      material.shininess   );
        gl.uniform1f ( g_addrs.smoothness_loc,     material.smoothness  );
        gl.uniform1f ( g_addrs.animation_time_loc, g_state.animation_time / 1000 );

        if( !g_state.lights.length )  return;
        var lightPositions_flattened = [], lightColors_flattened = []; lightAttenuations_flattened = [];
        for( var i = 0; i < 4 * g_state.lights.length; i++ )
          { lightPositions_flattened                  .push( g_state.lights[ Math.floor(i/4) ].position[i%4] );
            lightColors_flattened                     .push( g_state.lights[ Math.floor(i/4) ].color[i%4] );
            lightAttenuations_flattened[ Math.floor(i/4) ] = g_state.lights[ Math.floor(i/4) ].attenuation;
          }
        gl.uniform4fv( g_addrs.lightPosition_loc,       lightPositions_flattened );
        gl.uniform4fv( g_addrs.lightColor_loc,          lightColors_flattened );
        gl.uniform1fv( g_addrs.attenuation_factor_loc,  lightAttenuations_flattened );
      },
    'vertex_glsl_code_string'  : function()           // ********* VERTEX SHADER *********
      { return `
          // The following string is loaded by our javascript and then used as the Vertex Shader program.  Our javascript sends this code to the graphics card at runtime, where on each run it gets
          // compiled and linked there.  Thereafter, all of your calls to draw shapes will launch the vertex shader program once per vertex in the shape (three times per triangle), sending results on
          // to the next phase.  The purpose of this program is to calculate the final resting place of vertices in screen coordinates; each of them starts out in local object coordinates.

          precision mediump float;
          const int N_LIGHTS = 2;               // Be sure to keep this line up to date as you add more lights

          attribute vec4 vColor;
          attribute vec3 vPosition, vNormal;
          attribute vec2 vTexCoord;
          varying vec2 fTexCoord;
          varying vec3 N, E, pos;

          uniform float ambient, diffusivity, shininess, smoothness, animation_time, attenuation_factor[N_LIGHTS];
          uniform bool GOURAUD, COLOR_NORMALS, COLOR_VERTICES;    // Flags for alternate shading methods

          uniform vec4 lightPosition[N_LIGHTS], lightColor[N_LIGHTS], shapeColor;
          varying vec4 VERTEX_COLOR;
          varying vec3 L[N_LIGHTS], H[N_LIGHTS];
          varying float dist[N_LIGHTS];

          uniform mat4 camera_transform, camera_model_transform, projection_camera_model_transform;
          uniform mat3 camera_model_transform_normal;

          void main()
          {
            N = normalize( camera_model_transform_normal * vNormal );

            vec4 object_space_pos = vec4(vPosition, 1.0);
            gl_Position = projection_camera_model_transform * object_space_pos;
            fTexCoord = vTexCoord;

            if( COLOR_NORMALS || COLOR_VERTICES )   // Bypass phong lighting if we're lighting up vertices some other way
            {
              VERTEX_COLOR   = COLOR_NORMALS ? ( vec4( N[0] > 0.0 ? N[0] : sin( animation_time * 3.0   ) * -N[0],             // In normals mode, rgb color = xyz quantity.  Flash if it's negative.
                                                       N[1] > 0.0 ? N[1] : sin( animation_time * 15.0  ) * -N[1],
                                                       N[2] > 0.0 ? N[2] : sin( animation_time * 45.0  ) * -N[2] , 1.0 ) ) : vColor;
              VERTEX_COLOR.a = VERTEX_COLOR.w;
              return;
            }

            pos = ( camera_model_transform * object_space_pos ).xyz;
            E = normalize( -pos );

            for( int i = 0; i < N_LIGHTS; i++ )
            {
              L[i] = normalize( ( camera_transform * lightPosition[i] ).xyz - lightPosition[i].w * pos );   // Use w = 0 for a directional light -- a vector instead of a point.
              H[i] = normalize( L[i] + E );
                                                                                // Is it a point light source?  Calculate the distance to it from the object.  Otherwise use some arbitrary distance.
              dist[i]  = lightPosition[i].w > 0.0 ? distance((camera_transform * lightPosition[i]).xyz, pos) : distance( attenuation_factor[i] * -lightPosition[i].xyz, object_space_pos.xyz );
            }

            if( GOURAUD )         // Gouraud mode?  If so, finalize the whole color calculation here in the vertex shader, one per vertex, before we even break it down to pixels in the fragment shader.
            {
              VERTEX_COLOR = vec4( shapeColor.xyz * ambient, shapeColor.w);
              for(int i = 0; i < N_LIGHTS; i++)
              {
                float attenuation_multiplier = 1.0 / (1.0 + attenuation_factor[i] * (dist[i] * dist[i]));
                float diffuse  = max(dot(L[i], N), 0.0);                                                                                          // TODO
                float specular = pow(max(dot(N, H[i]), 0.0), smoothness);                                                                                  // TODO

                VERTEX_COLOR.xyz += attenuation_multiplier * ( shapeColor.xyz * diffusivity * diffuse + lightColor[i].xyz * shininess * specular );
              }
              VERTEX_COLOR.a = VERTEX_COLOR.w;
            }
          }`;
      },
    'fragment_glsl_code_string': function()           // ********* FRAGMENT SHADER *********
      { return `
          // Likewise, the following string is loaded by our javascript and then used as the Fragment Shader program, which gets sent to the graphics card at runtime.  The fragment shader runs
          // once all vertices in a triangle / element finish their vertex shader programs, and thus have finished finding out where they land on the screen.  The fragment shader fills in (shades)
          // every pixel (fragment) overlapping where the triangle landed.  At each pixel it interpolates different values from the three extreme points of the triangle, and uses them in formulas
          // to determine color.

          precision mediump float;

          const int N_LIGHTS = 2;

          uniform vec4 lightColor[N_LIGHTS], shapeColor;
          varying vec3 L[N_LIGHTS], H[N_LIGHTS];
          varying float dist[N_LIGHTS];
          varying vec4 VERTEX_COLOR;

          uniform float ambient, diffusivity, shininess, smoothness, animation_time, attenuation_factor[N_LIGHTS];

          varying vec2 fTexCoord;   // per-fragment interpolated values from the vertex shader
          varying vec3 N, E, pos;

          uniform sampler2D texture;
          uniform bool GOURAUD, COLOR_NORMALS, COLOR_VERTICES, USE_TEXTURE;

          void main()
          {
            if( GOURAUD || COLOR_NORMALS )    // Bypass phong lighting if we're only interpolating predefined colors across vertices
            {
              gl_FragColor = VERTEX_COLOR;
              return;
            }

            vec4 tex_color = texture2D( texture, fTexCoord );
            gl_FragColor = tex_color * ( USE_TEXTURE ? ambient : 0.0 ) + vec4( shapeColor.xyz * ambient, USE_TEXTURE ? shapeColor.w * tex_color.w : shapeColor.w ) ;
            for( int i = 0; i < N_LIGHTS; i++ )
            {
              float attenuation_multiplier = 1.0 / (1.0 + attenuation_factor[i] * (dist[i] * dist[i]));
              float diffuse  = max(dot(L[i], N), 0.0);                                                                                 // TODO
              float specular = pow(max(dot(N, H[i]), 0.0), smoothness);                                                                                // TODO

              gl_FragColor.xyz += attenuation_multiplier * (shapeColor.xyz * diffusivity * diffuse  + lightColor[i].xyz * shininess * specular );
            }
            gl_FragColor.a = gl_FragColor.w;
          }`;
      }
  }, Shader );

Declare_Any_Class( "Funny_Shader",                    // This one borrows almost everything from Phong_or_Gouraud_Shader.
  { 'fragment_glsl_code_string': function()           // ********* FRAGMENT SHADER *********
      { return `
          // An alternate fragment shader to the above that's a procedural function of time.
          precision mediump float;

          uniform float animation_time;
          uniform bool USE_TEXTURE;
          varying vec2 fTexCoord;   // per-fragment interpolated values from the vertex shader

          void main()
          {
            if( !USE_TEXTURE ) return;    // USE_TEXTURE must be enabled for any shape using this shader; otherwise texture_coords lookup will fail.

            float a = animation_time, u = fTexCoord.x, v = fTexCoord.y;

            gl_FragColor = vec4(
              2.0 * u * sin(17.0 * u ) + 3.0 * v * sin(11.0 * v ) + 1.0 * sin(13.0 * a),
              3.0 * u * sin(18.0 * u ) + 4.0 * v * sin(12.0 * v ) + 2.0 * sin(14.0 * a),
              4.0 * u * sin(19.0 * u ) + 5.0 * v * sin(13.0 * v ) + 3.0 * sin(15.0 * a),
              5.0 * u * sin(20.0 * u ) + 6.0 * v * sin(14.0 * v ) + 4.0 * sin(16.0 * a));
            gl_FragColor.a = gl_FragColor.w;
          }`;
      }
  }, Phong_or_Gouraud_Shader );

Declare_Any_Class("Test_Shader",
{
  'vertex_glsl_code_string': function() {
    return `
      attribute vec2 vPos;
      uniform mat4 inv_mvp;
      varying vec3 tex_coord;
      void main(){
        gl_Position = vec4(vPos, 0, 1);
        tex_coord = (inv_mvp * gl_Position).xyz;
      }`;
  },
  'fragment_glsl_code_string': function() {
    return `
      precision mediump float;

      uniform samplerCube samp;
      varying vec2 fTexCoord;

      void main() {
        gl_FragColor = textureCube(samp, fTexCoord);
      }`;
  }
}, Phong_or_Gouraud_Shader);

// Declare_Any_Class("Particle_Shader",
// {
//   'vertex_glsl_code_string': function() {
//     return `
//       uniform float uTime;
//       uniform vec3 uCenterPosition;
//
//       attribute float aLifetime;
//       attribute vec3 aStartPosition;
//       attribute vec3 aEndPosition;
//       attribute vec2 aOffset;
//       attribute vec2 aTextureCoords;
//
//       varying float vLifetime;
//       varying vec2 vTextureCoords;
//
//
//       void main() {
//         if (uTime <= aLifetime) {
//           gl_Position.xyz = aStartPosition + (uTime * aEndPosition);
//           gl_Position.xyz += uCenterPosition;
//           gl_Position.w = 1.0;
//         } else {
//           gl_Position = vec4(-1000, -1000, 0, 0);
//         }
//
//         vLifetime = 1.0 - (uTime / aLifetime);
//         vLifetime = clamp(vLifetime, 0.0, 1.0);
//         float size = (vLifetime * vLifetime) * 0.1;
//         gl_Position.xy += aOffset.xy * size;
//         vTextureCoords = aTextureCoords;
//       }`;
//   },
//   'fragment_glsl_code_string': function() {
//     return `
//       precision mediump float;
//
//       uniform vec4 uColor;
//
//       varying float vLifetime;
//       varying vec2 vTextureCoords;
//
//       uniform sampler2D sTexture;
//
//
//       void main() {
//         vec4 texColor;
//         texColor = texture2D(sTexture, vTextureCoords);
//         gl_FragColor = vec4(uColor) * texColor;
//         gl_FragColor.a *= vLifetime;
//       }`;
//   }
// }, Shader);

// Declare_Any_Class("Fog_Shader",
// {
//   'vertex_glsl_code_string': function() {
//     return `
//       attribute vec4 vColor;

//       layout(location = 0) in vec3 vPosition;
//       layout(location = 1) in vec3 vNormal;
//       layout(location = 2) in vec2 vTexCoord;

//       varying vec2 fTexCoord;
//       varying vec3 N, E, pos;

//       uniform float ambient, diffusivity, shininess, smoothness, animation_time, attenuation_factor[N_LIGHTS];
//       uniform bool GOURAUD, COLOR_NORMALS, COLOR_VERTICES;    // Flags for alternate shading methods

//       uniform vec4 lightPosition[N_LIGHTS], lightColor[N_LIGHTS], shapeColor;
//       varying vec4 VERTEX_COLOR;
//       varying vec3 L[N_LIGHTS], H[N_LIGHTS];
//       varying float dist[N_LIGHTS];

//       uniform mat4 camera_transform, camera_model_transform, projection_camera_model_transform;
//       uniform mat3 camera_model_transform_normal;

//       N = normalize( camera_model_transform_normal * vNormal );

//             vec4 object_space_pos = vec4(vPosition, 1.0);
//             gl_Position = projection_camera_model_transform * object_space_pos;
//             fTexCoord = vTexCoord;

//             if( COLOR_NORMALS || COLOR_VERTICES )   // Bypass phong lighting if we're lighting up vertices some other way
//             {
//               VERTEX_COLOR   = COLOR_NORMALS ? ( vec4( N[0] > 0.0 ? N[0] : sin( animation_time * 3.0   ) * -N[0],             // In normals mode, rgb color = xyz quantity.  Flash if it's negative.
//                                                        N[1] > 0.0 ? N[1] : sin( animation_time * 15.0  ) * -N[1],
//                                                        N[2] > 0.0 ? N[2] : sin( animation_time * 45.0  ) * -N[2] , 1.0 ) ) : vColor;
//               VERTEX_COLOR.a = VERTEX_COLOR.w;
//               return;
//             }

//             pos = ( camera_model_transform * object_space_pos ).xyz;
//             E = normalize( -pos );

//             for( int i = 0; i < N_LIGHTS; i++ )
//             {
//               L[i] = normalize( ( camera_transform * lightPosition[i] ).xyz - lightPosition[i].w * pos );   // Use w = 0 for a directional light -- a vector instead of a point.
//               H[i] = normalize( L[i] + E );
//                                                                                 // Is it a point light source?  Calculate the distance to it from the object.  Otherwise use some arbitrary distance.
//               dist[i]  = lightPosition[i].w > 0.0 ? distance((camera_transform * lightPosition[i]).xyz, pos) : distance( attenuation_factor[i] * -lightPosition[i].xyz, object_space_pos.xyz );
//             }

//             if( GOURAUD )         // Gouraud mode?  If so, finalize the whole color calculation here in the vertex shader, one per vertex, before we even break it down to pixels in the fragment shader.
//             {
//               VERTEX_COLOR = vec4( shapeColor.xyz * ambient, shapeColor.w);
//               for(int i = 0; i < N_LIGHTS; i++)
//               {
//                 float attenuation_multiplier = 1.0 / (1.0 + attenuation_factor[i] * (dist[i] * dist[i]));
//                 float diffuse  = max(dot(L[i], N), 0.0);                                                                                          // TODO
//                 float specular = pow(max(dot(N, H[i]), 0.0), smoothness);                                                                                  // TODO

//                 VERTEX_COLOR.xyz += attenuation_multiplier * ( shapeColor.xyz * diffusivity * diffuse + lightColor[i].xyz * shininess * specular );
//               }
//               VERTEX_COLOR.a = VERTEX_COLOR.w;
//             }
//           }`;
//   },
//   'fragment_glsl_code_string': function() {
//     return `
//       layout(location = 0) out vec4 out_color;

//       uniform vec3 light_position;
//       uniform vec3 eye_position;

//       uniform sampler2D texture1;

//       //0 linear; 1 exponential; 2 exponential square
//       uniform int fogSelector;
//       //0 plane based; 1 range based
//       uniform int depthFog;

//       //can pass them as uniforms
//       const vec3 DiffuseLight = vec3(0.15, 0.05, 0.0);
//       const vec3 RimColor = vec3(0.2, 0.2, 0.2);

//       //from vertex shader
//       in vec3 world_pos;
//       in vec3 world_normal;
//       in vec4 viewSpace;
//       in vec2 texcoord;

//       const vec3 fogColor = vec3(0.5, 0.5,0.5);
//       const float FogDensity = 0.05;

//       void main(){

//       vec3 tex1 = texture(texture1, texcoord).rgb;

//       //get light an view directions
//       vec3 L = normalize( light_position - world_pos);
//       vec3 V = normalize( eye_position - world_pos);

//       //diffuse lighting
//       vec3 diffuse = DiffuseLight * max(0, dot(L,world_normal));

//       //rim lighting
//       float rim = 1 - max(dot(V, world_normal), 0.0);
//       rim = smoothstep(0.6, 1.0, rim);
//       vec3 finalRim = RimColor * vec3(rim, rim, rim);
//       //get all lights and texture
//       vec3 lightColor = finalRim + diffuse + tex1;

//       vec3 finalColor = vec3(0, 0, 0);

//       //distance
//       float dist = 0;
//       float fogFactor = 0;

//       //compute distance used in fog equations
//       if(depthFog == 0)//select plane based vs range based
//       {
//         //plane based
//         dist = abs(viewSpace.z);
//         //dist = (gl_FragCoord.z / gl_FragCoord.w);
//       }
//       else
//       {
//          //range based
//          dist = length(viewSpace);
//       }

//       if(fogSelector == 0)//linear fog
//       {
//          // 20 - fog starts; 80 - fog ends
//          fogFactor = (80 - dist)/(80 - 20);
//          fogFactor = clamp( fogFactor, 0.0, 1.0 );

//          //if you inverse color in glsl mix function you have to
//          //put 1.0 - fogFactor
//          finalColor = mix(fogColor, lightColor, fogFactor);
//       }
//       else if( fogSelector == 1)// exponential fog
//       {
//           fogFactor = 1.0 /exp(dist * FogDensity);
//           fogFactor = clamp( fogFactor, 0.0, 1.0 );

//           // mix function fogColor⋅(1−fogFactor) + lightColor⋅fogFactor
//           finalColor = mix(fogColor, lightColor, fogFactor);
//       }
//       else if( fogSelector == 2)
//       {
//          fogFactor = 1.0 /exp( (dist * FogDensity)* (dist * FogDensity));
//          fogFactor = clamp( fogFactor, 0.0, 1.0 );

//          finalColor = mix(fogColor, lightColor, fogFactor);
//       }

//       //show fogFactor depth(gray levels)
//       //fogFactor = 1 - fogFactor;
//       //out_color = vec4( fogFactor, fogFactor, fogFactor,1.0 );
//       out_color = vec4(finalColor, 1);

//       }`;
//   }
// }, Phong_or_Gouraud_Shader);

Declare_Any_Class("Simple_Shader",
{
  'update_uniforms'          : function( g_state, model_transform )     // Send javascrpt's variables to the GPU to update its overall state.
  {
      let [ P, C, M ]  = [ g_state.projection_transform, g_state.camera_transform, model_transform ],   // PCM will mean Projection * Camera * Model
      CM             = mult( C,  M ),
      PCM            = mult( P, CM ),                               // Send the current matrices to the shader.  Go ahead and pre-compute the products
      inv_trans_CM   = toMat3( transpose( inverse( CM ) ) );        // we'll need of the of the three special matrices and just send those, since these
                                                                    // will be the same throughout this draw call & across each instance of the vertex shader.
    gl.uniformMatrix4fv( g_addrs.camera_transform_loc,                  false, flatten(  C  ) );
    gl.uniformMatrix4fv( g_addrs.camera_model_transform_loc,            false, flatten(  CM ) );
    gl.uniformMatrix4fv( g_addrs.projection_camera_model_transform_loc, false, flatten( PCM ) );
  },
  'vertex_glsl_code_string': function() {
    return `
      attribute  vec3 vPosition; // holds all vertices
      uniform vec4 vColor;
      varying vec4 fColor;

      uniform mat4 camera_transform, camera_model_transform, projection_camera_model_transform;

      // runs for each vertex sent in buffer
      void main()
      {
          fColor = vColor;
          vec4 object_space_pos = vec4(vPosition, 1.0);
          gl_Position = projection_camera_model_transform * object_space_pos;
      }`;
  },
  'fragment_glsl_code_string': function() {
    return `
      precision mediump float;

      varying vec4 fColor;

      void
      main()
      {
          gl_FragColor = fColor;
      }`;
  }
}, Shader);

//
// PARTICLE_SHADER_BEGIN
//

Declare_Any_Class("Particle_Shader",
{'update_uniforms'          :function(g_state, model_transform, material, color, delta, speed)
    {
        let [ P, C, M ]  = [ g_state.projection_transform, g_state.camera_transform, model_transform ],   // PCM will mean Projection * Camera * Model
        CM             = mult( C,  M ),
        PCM            = mult( P, CM ),                               // Send the current matrices to the shader.  Go ahead and pre-compute the products
        inv_trans_CM   = toMat3( transpose( inverse( CM ) ) );        // we'll need of the of the three special matrices and just send those, since these
                                                                      // will be the same throughout this draw call & across each instance of the vertex shader.

        gl.uniformMatrix4fv( g_addrs.projection_camera_model_transform_loc, false, flatten( PCM ) );

        gl.uniform1f(g_addrs.delta_loc, delta);
        gl.uniform1f(g_addrs.speed_loc, speed);
        gl.uniform4f(g_addrs.uColor_loc, color[0], color[1], color[2], color[3]);
    },
'vertex_glsl_code_string'  : function()           // ********* VERTEX SHADER *********
  { return `
        uniform float delta;
        uniform float speed;
        uniform mat4 projection_camera_model_transform;

        attribute float aLifetime;
        attribute vec3 aStartPosition;
        attribute vec3 aEndPosition;
        attribute vec2 aOffset;
        attribute vec2 vTexCoord;

        varying vec2 fTexCoord;
        varying float vLifetime;

        void main(void) {
          fTexCoord = vTexCoord;

          float lifetime = aLifetime / speed;

          float ageRatio = 1.0 - ((lifetime - mod(delta, lifetime)) / lifetime);

          gl_Position.xyz = aStartPosition + (ageRatio * aEndPosition);
          gl_Position.w = 1.0;

          vLifetime = 1.0 - (ageRatio / lifetime);
          vLifetime = clamp(vLifetime, 0.0, 1.0);
          float size = (vLifetime * vLifetime) * 0.1;
          gl_Position.xy += aOffset.xy * size;
          gl_Position = projection_camera_model_transform * gl_Position;
        }`;
  },
'fragment_glsl_code_string': function()           // ********* FRAGMENT SHADER *********
  { return `
        precision mediump float;

        uniform vec4 uColor;
        uniform sampler2D texture;

        varying vec2 fTexCoord;   // per-fragment interpolated values from the vertex shader
        varying float vLifetime;

        void main(void) {
          vec4 tex_color = texture2D( texture, fTexCoord );
          gl_FragColor = vec4(uColor) * tex_color;
          gl_FragColor.a *= vLifetime;
        }`;
  }
}, Shader );

//
// PARTICLE_SHADER_END
