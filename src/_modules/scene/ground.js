
import * as THREE from 'three';



export default function ground(scene) {

    // const gridHelper = new THREE.GridHelper(20, 20, 0x555555, 0x555555)
    // scene.add(gridHelper)

    const material_2 = new THREE.MeshStandardMaterial( { color: 0x777777 } );

    const ground_plane = new THREE.Mesh( new THREE.PlaneGeometry( 10, 10 ), material_2 );
    ground_plane.receiveShadow = true;
    ground_plane.rotateX(-Math.PI / 2);
    ground_plane.position.y = -0.01;
    scene.add( ground_plane );

}


