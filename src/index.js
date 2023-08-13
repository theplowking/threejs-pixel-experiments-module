

import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import lights from './_modules/setup/lights.js';
import * as camera from './_modules/setup/camera.js';
import * as rendererMod from './_modules/setup/renderer.js';

import ground from './_modules/scene/ground.js';
import * as cube from './_modules/scene/cube.js';

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x111111 );
const renderer = new THREE.WebGLRenderer({antialias:true});
const threejs_canvas = document.getElementById("three");

//RENDERER
rendererMod.setup(renderer, threejs_canvas);

//CAMERA
camera.setup(renderer);

//LIGHTS
lights(scene); // Example module

//BACKGROUND
ground(scene);

//OBJECTS
cube.setup(scene);





//MAIN LOOP
function animate() {
    requestAnimationFrame( animate );
    camera.update()    
    cube.update();
    renderer.render( scene, camera.camera );
    //stats.update()
}

animate();



