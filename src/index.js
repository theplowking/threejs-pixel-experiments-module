

import * as THREE from 'three';
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

import ground from './_modules/scene/ground.js';
import skybox from './_modules/scene/skybox.js';
import water2 from './_modules/scene/water2.js';
import * as cube from './_modules/scene/cube.js';
import * as fire from './_modules/scene/fire.js';
import * as rain from './_modules/scene/rain.js';
import * as tree1 from './_modules/scene/tree1.js';
import tree2 from './_modules/scene/tree2.js';
import modelGLTF from './_modules/scene/modelGLTF.js';

import * as character from './_modules/scene/character.js';

// SCENE
const scene = new THREE.Scene();
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
 //ground(scene);
 //skybox(scene);
 modelGLTF(scene);
// water2(scene, gui);

//OBJECTS
//cube.setup(scene);
fire.setup(scene, camera.camera);
rain.setup(scene, camera.camera);
character.setup(scene, camera.camera);
//tree1.setup(scene, gui);


//gui
setupGUI(gui);



//MAIN LOOP
function animate() {
    requestAnimationFrame( animate );

    const delta = clock.getDelta();

    camera.update()    
    //cube.update(delta); 
    //fire.update(delta);
    rain.update(delta);
    //lights.update(delta);
    character.update(delta);
    //tree1.update(delta);
    
    // pixelPass.update(renderer, camera.camera);

    composer.render();
    //renderer.render(scene, camera.camera); 
}

animate();




function setupGUI(gui) {
    //gui.useLocalStorage = true;
    pixelPass.setupGUI(gui);
}