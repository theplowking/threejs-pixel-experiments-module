import * as THREE from 'three';

export function setup(renderer, canvas) {

    renderer.setSize( window.innerWidth, window.innerHeight );
    //renderer.setPixelRatio( window.devicePixelRatio );
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.enabled = true
    
    canvas.appendChild(renderer.domElement);

}

export function update() {

    

}

