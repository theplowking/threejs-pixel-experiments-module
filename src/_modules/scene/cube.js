
import * as THREE from 'three';

let cube;

export function setup(scene) {

    const material_1 = new THREE.MeshStandardMaterial( { color: 0xffffff } );


    cube = new THREE.Mesh(new THREE.BoxGeometry( 1, 1, 1 ), material_1 );
    cube.castShadow = true;
    cube.position.y = 1;
    scene.add( cube );


}


export function update() {

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

}