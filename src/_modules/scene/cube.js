
import * as THREE from 'three';

let cube, torusKnot;

export function setup(scene) {

    // const material_1 = new THREE.MeshStandardMaterial( { color: 0xffffff } );


    // cube = new THREE.Mesh(new THREE.BoxGeometry( 1, 1, 1 ), material_1 );
    // cube.castShadow = true;
    // cube.position.y = 1;
    // scene.add( cube );

    const torusKnotGeometry = new THREE.TorusKnotGeometry( 3, 1, 256, 32 );
    const torusKnotMaterial = new THREE.MeshNormalMaterial();

    torusKnot = new THREE.Mesh( torusKnotGeometry, torusKnotMaterial );
    torusKnot.position.y = 4;
    torusKnot.scale.set( 0.5, 0.5, 0.5 );
    scene.add( torusKnot );

}


export function update(delta) {

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    torusKnot.rotation.x += delta;
	torusKnot.rotation.y += delta * 0.5;

}