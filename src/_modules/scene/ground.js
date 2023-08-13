
import * as THREE from 'three';



export default function ground(scene) {

    // const gridHelper = new THREE.GridHelper(20, 20, 0x555555, 0x555555)
    // scene.add(gridHelper)

    const groundGeometry = new THREE.PlaneGeometry( 20, 20 );
    const groundMaterial = new THREE.MeshStandardMaterial( { roughness: 0.8, metalness: 0.4 } );
    const ground = new THREE.Mesh( groundGeometry, groundMaterial );
    ground.rotation.x = Math.PI * - 0.5;
    scene.add( ground );

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load( 'textures/hardwood2_diffuse.jpg', function ( map ) {

        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;
        map.repeat.set( 4, 4 );
        map.colorSpace = THREE.SRGBColorSpace;
        groundMaterial.map = map;
        groundMaterial.needsUpdate = true;

    } );

}


