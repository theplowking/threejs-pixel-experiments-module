import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export let camera, controls;

export function setup(renderer, composer) {

    const aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set(-30, 30, -30);

    camera.position.set(-9.77, 15, -6.4);


    //camera = new THREE.OrthographicCamera( - aspectRatio, aspectRatio, 1, - 1, 0.1, 1000 );
    // camera.position.y = 2 * Math.tan( Math.PI / 6 );
    // camera.position.z = 2;
    //camera.position.set(30, 30, 50);

    // camera.position.x=-32.04142803632075;
    // camera.position.y=52.05705025664092;
    // camera.position.z=-30.65911073081037;
    //camera.zoom=0.39721431845821925;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target = new THREE.Vector3(0, 1, 0);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI/2;
    controls.minPolarAngle = .01;
    // controls.minDistance = 4;
    // controls.maxDistance = 52;
    controls.enablePan = true;
    controls.listenToKeyEvents( window )

    controls.target.x=1.2551414760094688;
    controls.target.y=7.36321056062296;
    controls.target.z=3.0276693459082167;

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        composer.setSize( window.innerWidth, window.innerHeight );
        console.log(camera, controls);
    })

}

export function update() {

    controls.update();

}

