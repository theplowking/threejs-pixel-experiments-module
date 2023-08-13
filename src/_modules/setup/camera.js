import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export let camera, controls;

export function setup(renderer) {

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set(0,1,5);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target = new THREE.Vector3(0, 1, 0);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI/2;
    controls.minPolarAngle = .01;
    controls.minDistance = 4;
    controls.maxDistance = 52;
    controls.enablePan = true;
    controls.listenToKeyEvents( window )

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    })

}

export function update() {

    controls.update();

}

