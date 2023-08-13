
import * as THREE from 'three';



export default function skybox(scene) {

    const cubeTextureLoader = new THREE.CubeTextureLoader();
    cubeTextureLoader.setPath( 'textures/park/' );

    const cubeTexture = cubeTextureLoader.load( [
        'posx.jpg', 'negx.jpg',
        'posy.jpg', 'negy.jpg',
        'posz.jpg', 'negz.jpg'
    ] );

    scene.background = cubeTexture;

}


