
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

let sky, sun, pmremGenerator, sceneRef, rendererRef;
let renderTarget;

const params = {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.7,
    elevation: 2,
    azimuth: 180,
};

export function setup(scene, renderer, gui) {

    sceneRef = scene;
    rendererRef = renderer;

    sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);

    sun = new THREE.Vector3();

    pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;

    applyParams(renderer);
    setupGUI(gui, renderer);
}

function applyParams(renderer) {
    const uniforms = sky.material.uniforms;
    uniforms['turbidity'].value = params.turbidity;
    uniforms['rayleigh'].value = params.rayleigh;
    uniforms['mieCoefficient'].value = params.mieCoefficient;
    uniforms['mieDirectionalG'].value = params.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad(90 - params.elevation);
    const theta = THREE.MathUtils.degToRad(params.azimuth);
    sun.setFromSphericalCoords(1, phi, theta);

    uniforms['sunPosition'].value.copy(sun);

    updateEnvironment();
}

function updateEnvironment() {
    if (renderTarget) renderTarget.dispose();

    renderTarget = pmremGenerator.fromScene(sky);
    sceneRef.environment = renderTarget.texture;
}

function setupGUI(gui, renderer) {
    const folder = gui.addFolder('Sky');
    folder.add(params, 'turbidity', 0, 20, 0.1).onChange(() => applyParams(renderer));
    folder.add(params, 'rayleigh', 0, 4, 0.001).onChange(() => applyParams(renderer));
    folder.add(params, 'mieCoefficient', 0, 0.1, 0.001).onChange(() => applyParams(renderer));
    folder.add(params, 'mieDirectionalG', 0, 1, 0.001).onChange(() => applyParams(renderer));
    folder.add(params, 'elevation', 0, 90, 0.1).onChange(() => applyParams(renderer));
    folder.add(params, 'azimuth', -180, 180, 0.1).onChange(() => applyParams(renderer));
    folder.add(renderer, 'toneMappingExposure', 0, 1, 0.0001).name('exposure');
    folder.close();
}

export function update(delta) {
    // no per-frame updates needed for the basic Sky shader
}
