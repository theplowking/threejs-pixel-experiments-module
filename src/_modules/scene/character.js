
import * as THREE from 'three';

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { loadMixamoAnimation } from '../anim/loadMixamoAnimation.js';

let currentMixer, vrm;

export function setup(scene) {

const loader = new GLTFLoader();

// Install GLTFLoader plugin
loader.register((parser) => {
  return new VRMLoaderPlugin(parser);
});

loader.load(
  // URL of the VRM you want to load
  'models/girl wizard.vrm',

  // called when the resource is loaded
  (gltf) => {
    // retrieve a VRM instance from gltf
    vrm = gltf.userData.vrm;

    vrm.scene.scale.set(8,8,8);
    vrm.scene.rotation.y = -Math.PI/2; //90
    vrm.scene.position.set(15,-16,0);

    // add the loaded vrm to the scene
    scene.add(vrm.scene);


    // create AnimationMixer for VRM
	currentMixer = new THREE.AnimationMixer( vrm.scene );

	// Load animation
	loadMixamoAnimation( 'models/Sitting Idle.fbx', vrm ).then( ( clip ) => {

		// Apply the loaded animation to mixer and play
		currentMixer.clipAction( clip ).play();
		currentMixer.timeScale = 1.0;

	} );


    // deal with vrm features
    console.log(vrm);
  },

  // called while loading is progressing
  (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),

  // called when loading has errors
  (error) => console.error(error),
);

}


export function update(delta) {

    // if animation is loaded
	if ( currentMixer ) {

		// update the animation
		currentMixer.update( delta );

	}

	if ( vrm ) {

		vrm.update( delta );

	}

}