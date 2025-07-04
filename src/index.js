

import * as THREE from 'three';

import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger'

import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';

import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import * as lights from './_modules/setup/lights.js';
import * as camera from './_modules/setup/camera.js';
import * as rendererMod from './_modules/setup/renderer.js';

import * as pixelPass from './_modules/passes/pixelPass.js';
import palettePass from './_modules/passes/palettePass.js';

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import * as ground from './_modules/scene/ground.js';
import skybox from './_modules/scene/skybox.js';
import * as water2 from './_modules/scene/water2.js';
import * as boat from './_modules/scene/boat.js';

import * as water_noise from './_modules/scene/water_noise.js';
import * as water_noise_shader from './_modules/scene/water_noise_shader.js';
import * as cube from './_modules/scene/cube.js';
import * as fire from './_modules/scene/fire.js';
import * as rain from './_modules/scene/rain.js';
import * as tree1 from './_modules/scene/tree1.js';
import tree2 from './_modules/scene/tree2.js';
import modelGLTF from './_modules/scene/modelGLTF.js';
import * as terrain from './_modules/scene/terrain.js';

import * as town from './_modules/scene/town.js';
import * as character from './_modules/scene/character.js';



// SCENE
const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5))
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

const cannonDebugRenderer = new CannonDebugger(scene, world);

scene.background = new THREE.Color( 0xffffff );
const renderer = new THREE.WebGLRenderer({antialias:true});
let composer = new EffectComposer( renderer );
const threejs_canvas = document.getElementById("three");
let gui = new GUI();
let clock = new THREE.Clock();

//RENDERER
rendererMod.setup(renderer, threejs_canvas);
//set color space to fix tree, not ideal
//renderer.gammaFactor = 5;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
//CAMERA
camera.setup(renderer, composer);

//POST PROCESSING
pixelPass.setup(scene, camera.camera, composer, 1);
palettePass(composer, gui, false);

const outputPass = new OutputPass();
composer.addPass( outputPass );

//LIGHTS
lights.setup(scene, gui); 

//BACKGROUND
 //ground.setup(scene);
 skybox(scene);
 //modelGLTF(scene);
water2.setup(scene, gui, 500, 5);
//water_noise_shader.setup(scene, gui, 1000, 5);
terrain.setup(scene);
town.setup(scene);
//OBJECTS
//cube.setup(scene);
// fire.setup(scene, camera.camera);
// rain.setup(scene, camera.camera);
//character.setup(scene, camera.camera);
//tree1.setup(scene, gui);
//boat.setup(scene, water2, world, new THREE.Vector3(0, 5, 0));
boat.setup(scene, water2, world, new THREE.Vector3(0, 5, 0));

//gui
setupGUI(gui);



//MAIN LOOP
function animate() {
    requestAnimationFrame( animate );

    const delta = clock.getDelta();

    world.step(1/60, delta, 3);
    
    //cannonDebugRenderer.update(); // Update the CannonDebugger meshes
    
    camera.update(boat)    
    //cube.update(delta); 
    // fire.update(delta);
    // rain.update(delta);
    //lights.update(delta);
    //character.update(delta);
    //tree1.update(delta);
    //water_noise_shader.update(delta);
    //ground.update(delta);
    terrain.update(delta);
    water2.update(delta);
    boat.update(delta);
    // pixelPass.update(renderer, camera.camera);

    composer.render();
    //renderer.render(scene, camera.camera); 
}

animate();




function setupGUI(gui) {
    //gui.useLocalStorage = true;
    pixelPass.setupGUI(gui);
    boat.setupGUI(gui);
}