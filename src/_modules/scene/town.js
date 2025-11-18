import * as THREE from 'three';

import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const objects = [];

export function setup(scene, position = new THREE.Vector3(-90, 4.5, 80), rotate = -Math.PI / 1) {

    const manager = new THREE.LoadingManager();
    manager.addHandler(/\.dds$/i, new DDSLoader());

    var materials = new THREE.MeshStandardMaterial();

    new MTLLoader(manager)
        .setPath('../models/town/')
        .load('Town.mtl', function (materials) {

            //materials.preload();

            new OBJLoader(manager)
                .setMaterials(materials)
                .setPath('../models/town/')
                .load('town_test.obj', function (object) {

                    scene.add(parseTownscape(object, materials, position, rotate))
                }, onProgress, onError);

        });

}


export function update(delta) {


}

const onProgress = function (xhr) {

				if (xhr.lengthComputable) {

					const percentComplete = xhr.loaded / xhr.total * 100;
					console.log(Math.round(percentComplete, 2) + '% downloaded');

				}

			};

const onError = function (err) {console.error('Error loading model:', err); };

// LOAD THE TOWNSCAPER OBJ

		function parseTownscape(object, materials, position, rotate) {
			let uniforms = {
				townPalette: {
					type: "sampler2D",
					value: new THREE.TextureLoader().load("../models/town/TownPalette.png")
				},
				townColor: {
					type: "sampler2D",
					value: new THREE.TextureLoader().load("../models/town/TownColor.png")
				},
				townMaterial: {
					type: "sampler2D",
					value: new THREE.TextureLoader().load("../models/town/TownMaterial.png")
				},
			};
			uniforms.townColor.value.wrapS = THREE.RepeatWrapping;
			uniforms.townMaterial.value.wrapS = THREE.RepeatWrapping;

			function updateShader(shader) {
				shader.uniforms.townColor = uniforms.townColor;
				shader.uniforms.townPalette = uniforms.townPalette;
				shader.uniforms.townMaterial = uniforms.townMaterial;
				shader.vertexShader = 'varying vec2 vUv;\n' + shader.vertexShader.replace(
					'#include <uv_vertex>',
					`
						#include <uv_vertex>
						vUv = uv;
						`
				)
				shader.fragmentShader =
					`
						uniform sampler2D townColor;
						varying vec2 vUv;
						`
					+ shader.fragmentShader.replace(
						'vec4 diffuseColor = vec4( diffuse, opacity );',
						`
						vec4 diffuseColor;
						float gap = 0.05;
						vec2 tilePixel;
						vec2 pixel_st = fract(vec2(vUv));
						pixel_st = (pixel_st * vec2(128, 128)) + 0.5 + gap;

						// udpate uv's so even/odd pixels to product gaps/panels
						vec2 grout = floor(min(fract(pixel_st / 2.0) - gap, 0.0));
						tilePixel = floor(pixel_st / 2.0) * 2.0 + grout;
						tilePixel += 0.5;
						vec2 tile_uv = tilePixel / vec2(128, 128);
						vec2 final_uv = vec2(tile_uv.x, tile_uv.y);

						diffuseColor = texture2D(townColor, tile_uv);
						`
					)
			}

			function updateShaderColor(shader) {
				shader.uniforms.townColor = uniforms.townColor;
				shader.uniforms.townPalette = uniforms.townPalette;
				shader.uniforms.townMaterial = uniforms.townMaterial;
				shader.vertexShader = 'varying vec2 vUv;\n' + shader.vertexShader.replace(
					'#include <uv_vertex>',
					`
						#include <uv_vertex>
						vUv = uv;
						`
				)
				shader.fragmentShader =
					`
						uniform sampler2D townPalette;
						uniform sampler2D townColor;
						uniform sampler2D townMaterial;
			      varying vec2 vUv;
						`
					+ shader.fragmentShader.replace(
						'vec4 diffuseColor = vec4( diffuse, opacity );',
						`
						vec4 diffuseColor;
						float gap = 0.05;
						vec2 tilePixel;
						vec2 pixel_st = fract(vec2(vUv));
						pixel_st = (pixel_st * vec2(128, 128)) + 0.5 + gap;

						// udpate uv's so even/odd pixels to product gaps/panels
						vec2 grout = floor(min(fract(pixel_st / 2.0) - gap, 0.0));
						tilePixel = floor(pixel_st / 2.0) * 2.0 + grout;
						tilePixel += 0.5;
						vec2 tile_uv = tilePixel / vec2(128, 128);
						vec2 final_uv = vec2(tile_uv.x, tile_uv.y);

						// define colors
						vec4 colorA = vec4(texelFetch(townPalette, ivec2(vUv.x, 0.5), 0));
						vec4 colorB = texture2D(townColor, tile_uv);

						// roof colors
						vec4 roof_a = vec4(1.000, 0.558, 0.3, 0.0);
						vec4 roof_b = vec4(0.796, 0.403, 0.262, 0.0);

						// use townMaterial to mask the uv map
						vec4 mask = texture2D(townMaterial, tile_uv);

						int mat_id = 0;
						if (mask.g >= 1.0) { mat_id = 1; }

						if (mat_id == 1) {
							colorA = mix( roof_a, roof_b, colorA );
						}

						diffuseColor = vec4(mix(colorA, colorB, colorB.a));
						`
					)
			}

			const features = new THREE.Group();
			features.name = 'Townscape'
            //console.log(object);
			for (var i = 0; i < object.children.length; i++) {
				let feature = object.children[i].clone()
				feature.scale.multiplyScalar(3);
                feature.position.add(position);
                feature.rotation.y = rotate;
				feature.scale.x *= -1;

				if (feature.name == 'House') {
					feature.material = new THREE.MeshStandardMaterial();
					feature.material.onBeforeCompile = shader => updateShaderColor(shader);
					feature.material.side = THREE.FrontSide;
					feature.material.transparent = false;
					feature.castShadow = true;
					feature.receiveShadow = true;
					objects.push(feature);
					features.add(feature);
				}
				else if (feature.name == 'Fencing') {
					feature.material = new THREE.MeshStandardMaterial();
					feature.material.onBeforeCompile = shader => updateShader(shader);
					feature.material.side = THREE.DoubleSide;
					feature.material.transparent = true;
					objects.push(feature);
					features.add(feature);
				}
				else if (feature.name == 'Windows') {
					feature.material = new THREE.MeshStandardMaterial();
					feature.material.onBeforeCompile = shader => updateShaderColor(shader);
					feature.material.side = THREE.BackSide;
					feature.material.transparent = false;
					feature.receiveShadow = true;
					objects.push(feature);
					features.add(feature);
				}
				else if (feature.name == 'Water') {
				}
				else {
					feature.material = new THREE.MeshStandardMaterial();
					feature.material.onBeforeCompile = shader => updateShader(shader);
					feature.material.side = THREE.FrontSide;
					feature.material.transparent = false;
					feature.receiveShadow = true;
					objects.push(feature);
					features.add(feature);
				}
			}
            //console.log(features)
			return features
		}