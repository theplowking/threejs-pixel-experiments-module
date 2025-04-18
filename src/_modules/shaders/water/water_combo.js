import * as THREE from 'three';
import { Vector4 } from 'three';

/**
 * Full-screen textured quad shader
 */

const WaterShader = {

	name: 'WaterShader',

	uniforms: {

		'color': {
			type: 'c',
			value: null
		},

		'reflectivity': {
			type: 'f',
			value: 0
		},

		'tReflectionMap': {
			type: 't',
			value: null
		},

		'tRefractionMap': {
			type: 't',
			value: null
		},

		'tNormalMap0': {
			type: 't',
			value: null
		},

		'tNormalMap1': {
			type: 't',
			value: null
		},

		'textureMatrix': {
			type: 'm4',
			value: null
		},

		'config': {
			type: 'v4',
			value: new Vector4()
		},
        'uTime': { value: 0.0 },
        'uWavesAmplitude': { value: 0.5 },
        'uWavesSpeed': { value: 0.2 },
        'uWavesFrequency': { value: 0.02 },
        'uWavesPersistence': { value: 0.3 },
        'uWavesLacunarity': { value: 2.18 },
        'uWavesIterations': { value: 4 },
        'uTroughColor': { value: new THREE.Color('#186691') },
        'uSurfaceColor': { value: new THREE.Color('#9bd8c0') },
        'uPeakColor': { value: new THREE.Color('#bbd8e0') },
        'uPeakThreshold': { value: 0.08 },
        'uPeakTransition': { value: 0.05 },
        'uTroughThreshold': { value: -0.01 },
        'uTroughTransition': { value: 0.15 },
        'uFresnelScale': { value: 0.8 },
        'uFresnelPower': { value: 0.5 }

	},

	vertexShader: /* glsl */`

		precision highp float;

        uniform float uTime;

        uniform float uWavesAmplitude;
        uniform float uWavesSpeed;
        uniform float uWavesFrequency;
        uniform float uWavesPersistence;
        uniform float uWavesLacunarity;
        uniform float uWavesIterations;

        // Uniform for projective texturing (needed for vCoord)
uniform mat4 textureMatrix;

        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec4 vCoord;
        varying vec2 vUv;
		varying vec3 vToEye;

        //	Simplex 3D Noise 
        //	by Ian McEwan, Stefan Gustavson (https://github.com/stegu/webgl-noise)
        //
        vec4 permute(vec4 x) {
        return mod(((x * 34.0) + 1.0) * x, 289.0);
        }
        vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
        }

        // Simplex 2D noise
        //
        vec3 permute(vec3 x) {
        return mod(((x * 34.0) + 1.0) * x, 289.0);
        }

        float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
        m = m * m;
        m = m * m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
        }

        // Helper function to calculate elevation at any point
        float getElevation(float x, float z) {
        vec2 pos = vec2(x, z);

        float elevation = 0.0;
        float amplitude = 1.0;
        float frequency = uWavesFrequency;
        vec2 p = pos.xy;

        for(float i = 0.0; i < uWavesIterations; i++) {
            float noiseValue = snoise(p * frequency + uTime * uWavesSpeed);
            elevation += amplitude * noiseValue;
            amplitude *= uWavesPersistence;
            frequency *= uWavesLacunarity;
        }

        elevation *= uWavesAmplitude;

        return elevation;
        }

        void main() {
        // Pass UV coordinates to fragment shader
        vUv = uv;

        // Transform vertex position to model space
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);

        // Apply elevation displacement
        float elevation = getElevation(modelPosition.x, modelPosition.z);
        modelPosition.y += elevation;

        // Calculate normal using partial derivatives
        float eps = 0.001;
        vec3 tangent = normalize(vec3(eps, getElevation(modelPosition.x - eps, modelPosition.z) - elevation, 0.0));
        vec3 bitangent = normalize(vec3(0.0, getElevation(modelPosition.x, modelPosition.z - eps) - elevation, eps));
        vec3 objectNormal = normalize(cross(tangent, bitangent));

        // Assign normal and world position to varyings
        vNormal = objectNormal;
        vWorldPosition = modelPosition.xyz;

        vToEye = cameraPosition - vWorldPosition.xyz;

        // Compute projective texture coordinates
        vCoord = textureMatrix * vec4(position, 1.0);

        // Transform to clip space
        gl_Position = projectionMatrix * viewMatrix * modelPosition;
    }`,

	fragmentShader: /* glsl */`

		#include <common>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>

		uniform sampler2D tReflectionMap;
		uniform sampler2D tRefractionMap;
		uniform sampler2D tNormalMap0;
		uniform sampler2D tNormalMap1;

		#ifdef USE_FLOWMAP
			uniform sampler2D tFlowMap;
		#else
			uniform vec2 flowDirection;
		#endif

		uniform vec3 color;
		uniform float reflectivity;
		uniform vec4 config;

		varying vec4 vCoord;
		varying vec2 vUv;
		varying vec3 vToEye;

		void main() {

			#include <logdepthbuf_fragment>

			float flowMapOffset0 = config.x;
			float flowMapOffset1 = config.y;
			float halfCycle = config.z;
			float scale = config.w;

			vec3 toEye = normalize( vToEye );

			// determine flow direction
			vec2 flow;
			#ifdef USE_FLOWMAP
				flow = texture2D( tFlowMap, vUv ).rg * 2.0 - 1.0;
			#else
				flow = flowDirection;
			#endif
			flow.x *= - 1.0;

			// sample normal maps (distort uvs with flowdata)
			vec4 normalColor0 = texture2D( tNormalMap0, ( vUv * scale ) + flow * flowMapOffset0 );
			vec4 normalColor1 = texture2D( tNormalMap1, ( vUv * scale ) + flow * flowMapOffset1 );

			// linear interpolate to get the final normal color
			float flowLerp = abs( halfCycle - flowMapOffset0 ) / halfCycle;
			vec4 normalColor = mix( normalColor0, normalColor1, flowLerp );

			// calculate normal vector
			vec3 normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );

			// calculate the fresnel term to blend reflection and refraction maps
			float theta = max( dot( toEye, normal ), 0.0 );
			float reflectance = reflectivity + ( 1.0 - reflectivity ) * pow( ( 1.0 - theta ), 5.0 );

			// calculate final uv coords
			vec3 coord = vCoord.xyz / vCoord.w;
			vec2 uv = coord.xy + coord.z * normal.xz * 0.05;

			vec4 reflectColor = texture2D( tReflectionMap, vec2( 1.0 - uv.x, uv.y ) );
			vec4 refractColor = texture2D( tRefractionMap, uv );

			// multiply water color with the mix of both textures
			gl_FragColor = vec4( color, 1.0 ) * mix( refractColor, reflectColor, 0.1 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>

		}`

};

export { WaterShader };