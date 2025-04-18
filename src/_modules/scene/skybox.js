
import * as THREE from 'three';



export default function skybox(scene) {

    const cubeTextureLoader = new THREE.CubeTextureLoader();
    cubeTextureLoader.setPath( 'textures/sunset/' );

    const cubeTexture = cubeTextureLoader.load( [
        'px.png', // positive x
        'nx.png', // negative x 
        'py.png', // positive y
        'ny.png', // negative y
        'pz.png', // positive z
        'nz.png'  // negative z
    ] );

    scene.background = cubeTexture;

}


