import * as THREE from 'three';
/**
 * Full-screen textured quad shader
 */

const CausticsShader = {

    name: 'CausticsShader',

    uniforms: {

        'uTime': { value: 0.0 },
        'uTexture': { value: null },
        'uCausticsColor': { value: new THREE.Color('#186691') },
        'uCausticsIntensity': { value: 1.0 },
        'uCausticsOffset': { value: 0.5 },
        'uCausticsScale': { value: 1.0 },
        'uCausticsSpeed': { value: 0.2 },
        'uCausticsThickness': { value: 0.1 },
        'uHeightMin': { value: 0.0 },
        'uHeightMax': { value: 1.0 }

    },

    vertexShader: /* glsl */`

    
        #define STANDARD
        varying vec3 vViewPosition;

        /* --- custom varyings --- */
        varying vec3 vWorldPosCustom;      // always-available world position (xyz)

        varying vec2 vUv;

        #ifndef USE_TRANSMISSION
            varying vec3 vWorldPosition;
        #endif

        #include <common>
        #include <batching_pars_vertex>
        #include <uv_pars_vertex>
        #include <displacementmap_pars_vertex>
        #include <color_pars_vertex>
        #include <fog_pars_vertex>
        #include <normal_pars_vertex>
        #include <morphtarget_pars_vertex>
        #include <skinning_pars_vertex>
        #include <shadowmap_pars_vertex>
        #include <logdepthbuf_pars_vertex>
        #include <clipping_planes_pars_vertex>

        void main() {
            #include <uv_vertex>
            #include <color_vertex>
            #include <morphinstance_vertex>
            #include <morphcolor_vertex>
            #include <batching_vertex>

            // normals
            #include <beginnormal_vertex>
            #include <morphnormal_vertex>
            #include <skinbase_vertex>
            #include <skinnormal_vertex>
            #include <defaultnormal_vertex>
            #include <normal_vertex>

            // positions
            #include <begin_vertex>
            #include <morphtarget_vertex>
            #include <skinning_vertex>
            #include <displacementmap_vertex>
            #include <project_vertex>

            // depth, clipping
            #include <logdepthbuf_vertex>
            #include <clipping_planes_vertex>

            // view-space
            vViewPosition = - mvPosition.xyz;

            // world-space (Three.js writes worldPosition here)
            #include <worldpos_vertex>

            // --- custom passes ---
            vUv = uv;
                        
            // If possible, pass world y position for masking
            // Get the world position of the vertex
            worldPosition = modelMatrix * vec4(position, 1.0);
            
            //gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            // 2) always expose world position (xyz) regardless of transmission
            vWorldPosCustom = worldPosition.xyz;

            // shadows, fog, optional transmission varying
            #include <shadowmap_vertex>
            #include <fog_vertex>
            #ifdef USE_TRANSMISSION
                vWorldPosition = worldPosition.xyz;
            #endif
        }`,

    fragmentShader: /* glsl */`

        #define STANDARD
        #ifdef PHYSICAL
            #define IOR
            #define USE_SPECULAR
        #endif

        // --- stock uniforms ---
        uniform vec3 diffuse;
        uniform vec3 emissive;
        uniform float roughness;
        uniform float metalness;
        uniform float opacity;
        #ifdef IOR
            uniform float ior;
        #endif
        #ifdef USE_SPECULAR
            uniform float specularIntensity;
            uniform vec3 specularColor;
            #ifdef USE_SPECULAR_COLORMAP
                uniform sampler2D specularColorMap;
            #endif
            #ifdef USE_SPECULAR_INTENSITYMAP
                uniform sampler2D specularIntensityMap;
            #endif
        #endif
        #ifdef USE_CLEARCOAT
            uniform float clearcoat;
            uniform float clearcoatRoughness;
        #endif
        #ifdef USE_DISPERSION
            uniform float dispersion;
        #endif
        #ifdef USE_IRIDESCENCE
            uniform float iridescence;
            uniform float iridescenceIOR;
            uniform float iridescenceThicknessMinimum;
            uniform float iridescenceThicknessMaximum;
        #endif
        #ifdef USE_SHEEN
            uniform vec3 sheenColor;
            uniform float sheenRoughness;
            #ifdef USE_SHEEN_COLORMAP
                uniform sampler2D sheenColorMap;
            #endif
            #ifdef USE_SHEEN_ROUGHNESSMAP
                uniform sampler2D sheenRoughnessMap;
            #endif
        #endif
        #ifdef USE_ANISOTROPY
            uniform vec2 anisotropyVector;
            #ifdef USE_ANISOTROPYMAP
                uniform sampler2D anisotropyMap;
            #endif
        #endif

        varying vec3 vViewPosition;

        // --- custom uniforms (caustics) ---
        uniform float uTime;
        uniform vec3  uCausticsColor;
        uniform float uCausticsIntensity;
        uniform float uCausticsOffset;
        uniform float uCausticsScale;
        uniform float uCausticsSpeed;
        uniform float uCausticsThickness;
        uniform float uHeightMin;
        uniform float uHeightMax;

        varying vec2 vUv;
        varying vec3 vWorldPosition;

        // Provided by vertex shader:
        varying vec3 vWorldPosCustom;  // always-available world position

        #include <common>
        #include <packing>
        #include <dithering_pars_fragment>
        #include <color_pars_fragment>
        #include <uv_pars_fragment>
        #include <map_pars_fragment>
        #include <alphamap_pars_fragment>
        #include <alphatest_pars_fragment>
        #include <alphahash_pars_fragment>
        #include <aomap_pars_fragment>
        #include <lightmap_pars_fragment>
        #include <emissivemap_pars_fragment>
        #include <iridescence_fragment>
        #include <cube_uv_reflection_fragment>
        #include <envmap_common_pars_fragment>
        #include <envmap_physical_pars_fragment>
        #include <fog_pars_fragment>
        #include <lights_pars_begin>
        #include <normal_pars_fragment>
        #include <lights_physical_pars_fragment>
        #include <transmission_pars_fragment>
        #include <shadowmap_pars_fragment>
        #include <bumpmap_pars_fragment>
        #include <normalmap_pars_fragment>
        #include <clearcoat_pars_fragment>
        #include <iridescence_pars_fragment>
        #include <roughnessmap_pars_fragment>
        #include <metalnessmap_pars_fragment>
        #include <logdepthbuf_pars_fragment>
        #include <clipping_planes_pars_fragment>

        // -------- Simplex 3D noise (Gustavson/McEwan) --------
        vec4 permute(vec4 x){ return mod(((x * 34.0) + 1.0) * x, 289.0); }
        vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
        float snoise(vec3 v){
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

            vec3 i = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);

            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);

            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + 2.0 * C.xxx;
            vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

            i = mod(i, 289.0);
            vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));

            float n_ = 1.0/7.0;
            vec3  ns = n_ * D.wyz - D.xzx;

            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);

            vec4 x = x_ * ns.x + ns.yyyy;
            vec4 y = y_ * ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);

            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);

            vec4 s0 = floor(b0) * 2.0 + 1.0;
            vec4 s1 = floor(b1) * 2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));

            vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);

            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;

            return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        // -----------------------------------------------------

        void main() {
            vec4 diffuseColor = vec4( diffuse, opacity );

            #include <clipping_planes_fragment>
            ReflectedLight reflectedLight = ReflectedLight( vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0) );
            vec3 totalEmissiveRadiance = emissive;

            #include <logdepthbuf_fragment>
            #include <map_fragment>
            #include <color_fragment>
            #include <alphamap_fragment>
            #include <alphatest_fragment>
            #include <alphahash_fragment>
            #include <roughnessmap_fragment>
            #include <metalnessmap_fragment>
            #include <normal_fragment_begin>
            #include <normal_fragment_maps>
            #include <clearcoat_normal_fragment_begin>
            #include <clearcoat_normal_fragment_maps>
            #include <emissivemap_fragment>

            // ---------- custom: height mask + caustics + base color ----------

            // 1) Height-based opacity mask (active only between [uHeightMin, uHeightMax])
            //    (Matches your behavior: fades in between min->max, then zero above max)
            float heightMask = smoothstep(uHeightMin, uHeightMax, vWorldPosCustom.y) * (1.0 - step(uHeightMax, vWorldPosCustom.y));
            diffuseColor.a *= heightMask;

            // 2) Caustics pattern added as *emissive* contribution
            //    (texture is handled by #include <map_fragment> above)
            float c0 = uCausticsIntensity * (uCausticsOffset - abs(snoise(vec3(vUv.xy * uCausticsScale,  uTime * uCausticsSpeed))));
            float c1 = uCausticsIntensity * (uCausticsOffset - abs(snoise(vec3(vUv.yx * uCausticsScale, -uTime * uCausticsSpeed))));
            float caustics = c0 + c1;
            caustics = smoothstep(0.5 - uCausticsThickness, 0.5 + uCausticsThickness, caustics);

            totalEmissiveRadiance += heightMask * caustics * uCausticsColor;

            // -----------------------------------------------------------------

            #include <lights_physical_fragment>
            #include <lights_fragment_begin>
            #include <lights_fragment_maps>
            #include <lights_fragment_end>
            #include <aomap_fragment>

            vec3 totalDiffuse  = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
            vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;

            #include <transmission_fragment>

            vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;

            #ifdef USE_SHEEN
                float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
                outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
            #endif

            #ifdef USE_CLEARCOAT
                float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
                vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
                outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
            #endif

            #include <opaque_fragment>
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
            #include <fog_fragment>
            #include <premultiplied_alpha_fragment>
            #include <dithering_fragment>
        }`

};

export { CausticsShader };