
import * as THREE from 'three';

import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';

import particleFire from 'three-particle-fire/dist/three-particle-fire.module.js';

particleFire.install( { THREE: THREE } );

let particleFireMesh0, light;

export function setup(scene, camera) {

    var fireRadius = 3;
    var fireHeight = 3*6;
    var particleCount = 5000;

    // var fireRadius = 0.5;
    // var fireHeight = 3;
    // var particleCount = 800;

    var height = window.innerHeight;

    var geometry0 = new particleFire.Geometry( fireRadius, fireHeight, particleCount );
    var material0 = new particleFire.Material( { color: 0xff2200 } );
    material0.setPerspective( camera.fov, height );
    particleFireMesh0 = new THREE.Points( geometry0, material0 );
    particleFireMesh0.position.set( 0,-6,0 );
    scene.add( particleFireMesh0 );

    //add fire light
    light = new THREE.PointLight( 0xff2200, 50, 50, 1 ); //0xffffff //0xa333b6

    light.shadow.bias = -0.001;
    //light.position.set( 0, 16, 0  );
    light.castShadow = true;
    //light.shadow.bias = 0.0001;
    scene.add( light );

    // // Get position and distance of the point light
    // let lightPosition = light.position.clone(); // Clone the position so it doesn't directly affect the light
    // let lightDistance = light.distance;

    // // Create a sphere geometry and material
    // let sphereGeometry = new THREE.SphereGeometry(lightDistance, 32, 32);
    // let sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true }); // Adjust material as needed

    // // Create the sphere mesh
    // let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    // // Position the sphere to match the light's position
    // sphere.position.copy(lightPosition);

    // // Add the sphere to the scene
    // scene.add(sphere);

}


export function update(delta) {

    var time = performance.now() * 0.001;

    particleFireMesh0.material.update( time / 10000 );

    flickerAnimation(time);

}

// Define the flicker animation
function flickerAnimation(time) {
    // Randomly adjust the intensity and distance of the light
    const intensity = (new ImprovedNoise().noise(time, 0, 0) * 40) + 30; //THREE.MathUtils.randFloat(0.8, 1.0);
    const distance = (new ImprovedNoise().noise(time, 0, 0) * 10) + 45;
    light.intensity = intensity;
    //light.distance = distance;
    var range = 0.5;
    light.position.set( particleFireMesh0.position.x + (new ImprovedNoise().noise(time*2, 0, 0) * range),
                        particleFireMesh0.position.y + (new ImprovedNoise().noise(0, time*2, 0) * range) + 4,
                        particleFireMesh0.position.z + (new ImprovedNoise().noise(0, 0, time*2) * range));

};