
import * as THREE from 'three';

import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';

import particleFire from 'three-particle-fire/dist/three-particle-fire.module.js';

particleFire.install( { THREE: THREE } );

let particleFireMesh0, light;

export function setup(scene, camera) {

    var fireRadius = 1;
    var fireHeight = 5;
    var particleCount = 2000;
    var height = window.innerHeight;

    var geometry0 = new particleFire.Geometry( fireRadius, fireHeight, particleCount );
    var material0 = new particleFire.Material( { color: 0xff2200 } );
    material0.setPerspective( camera.fov, height );
    particleFireMesh0 = new THREE.Points( geometry0, material0 );
    particleFireMesh0.position.set( 0, 5,0 );
    scene.add( particleFireMesh0 );

    //add fire light
    light = new THREE.PointLight( 0xff2200, 100, 100, 1 ); //0xffffff //0xa333b6
    //light.position.set( 0, 16, 0  );
    light.castShadow = true;
    //light.shadow.bias = 0.0001;
    scene.add( light );

}


export function update(delta) {

    var time = performance.now() * 0.001;

    particleFireMesh0.material.update( time / 20000 );

    flickerAnimation(time);

}

// Define the flicker animation
function flickerAnimation(time) {
    // Randomly adjust the intensity and distance of the light
    const intensity = (new ImprovedNoise().noise(time, 0, 0) * 3) + 21; //THREE.MathUtils.randFloat(0.8, 1.0);
    const distance = (new ImprovedNoise().noise(time, 0, 0) * 0.3) + 21;
    light.intensity = intensity;
    light.distance = distance;
    var range = 0.1;
    light.position.set( particleFireMesh0.position.x + (new ImprovedNoise().noise(time*2, 0, 0) * range) - (range*2),
                        particleFireMesh0.position.y + (new ImprovedNoise().noise(0, time*2, 0) * range) - (range*2),
                        particleFireMesh0.position.z + 2 + (new ImprovedNoise().noise(0, 0, time*2) * range) - (range*2) );

};