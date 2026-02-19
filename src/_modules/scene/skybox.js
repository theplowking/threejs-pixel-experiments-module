
import * as THREE from 'three';



export default function skybox(scene) {

    const cubeTextureLoader = new THREE.CubeTextureLoader();
    // cubeTextureLoader.setPath( 'textures/sunset/' );

    // const cubeTexture = cubeTextureLoader.load( [
    //     'px.png', // positive x
    //     'nx.png', // negative x 
    //     'py.png', // positive y
    //     'ny.png', // negative y
    //     'pz.png', // positive z
    //     'nz.png'  // negative z
    // ] );

    cubeTextureLoader.setPath( 'textures/' );

    const cubeTexture = cubeTextureLoader.load( [
        'white.jpg', // positive x
        'white.jpg', // negative x 
        'white.jpg', // positive y
        'white.jpg', // negative y
        'white.jpg', // positive z
        'white.jpg'  // negative z
    ] );

    scene.background = cubeTexture;

}


