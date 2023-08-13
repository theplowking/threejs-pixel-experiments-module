
import * as THREE from 'three';

import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

let renderPixelatedPass, pixelSize;

export function setup(scene, camera, composer, pxSize) {

    pixelSize = pxSize;

    renderPixelatedPass = new RenderPixelatedPass( pixelSize, scene, camera );
    composer.addPass( renderPixelatedPass );

    const outputPass = new OutputPass();
    composer.addPass( outputPass );

    composer.setSize( window.innerWidth, window.innerHeight );

}


export function update(renderer, camera) {

    const rendererSize = renderer.getSize( new THREE.Vector2() );
    const aspectRatio = rendererSize.x / rendererSize.y;
    
    pixelAlignFrustum( camera, aspectRatio, Math.floor( rendererSize.x / 6 ),
            Math.floor( rendererSize.y / 6 ) );

}


export function setupGUI(gui) {
    let params = {pixelSize: pixelSize};
    
    const pixelFolder = gui.addFolder('Pixel Render');
    pixelFolder.add( params, 'pixelSize' ).min( 1 ).max( 16 ).step( 1 )
        .onChange( () => {

            renderPixelatedPass.setPixelSize( params.pixelSize );

        } );
    pixelFolder.add( renderPixelatedPass, 'normalEdgeStrength' ).min( 0 ).max( 2 ).step( .05 );
    pixelFolder.add( renderPixelatedPass, 'depthEdgeStrength' ).min( 0 ).max( 1 ).step( .05 );

    pixelFolder.close();
}






// Helper functions

function pixelTexture( texture ) {

    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;

}

function easeInOutCubic( x ) {

    return x ** 2 * 3 - x ** 3 * 2;

}

function linearStep( x, edge0, edge1 ) {

    const w = edge1 - edge0;
    const m = 1 / w;
    const y0 = - m * edge0;
    return THREE.MathUtils.clamp( y0 + m * x, 0, 1 );

}

function stopGoEased( x, downtime, period ) {

    const cycle = ( x / period ) | 0;
    const tween = x - cycle * period;
    const linStep = easeInOutCubic( linearStep( tween, downtime, period ) );
    return cycle + linStep;

}

function pixelAlignFrustum( camera, aspectRatio, pixelsPerScreenWidth, pixelsPerScreenHeight ) {

    // 0. Get Pixel Grid Units
    const worldScreenWidth = ( ( camera.right - camera.left ) / camera.zoom );
    const worldScreenHeight = ( ( camera.top - camera.bottom ) / camera.zoom );
    const pixelWidth = worldScreenWidth / pixelsPerScreenWidth;
    const pixelHeight = worldScreenHeight / pixelsPerScreenHeight;

    // 1. Project the current camera position along its local rotation bases
    const camPos = new THREE.Vector3(); camera.getWorldPosition( camPos );
    const camRot = new THREE.Quaternion(); camera.getWorldQuaternion( camRot );
    const camRight = new THREE.Vector3( 1.0, 0.0, 0.0 ).applyQuaternion( camRot );
    const camUp = new THREE.Vector3( 0.0, 1.0, 0.0 ).applyQuaternion( camRot );
    const camPosRight = camPos.dot( camRight );
    const camPosUp = camPos.dot( camUp );

    // 2. Find how far along its position is along these bases in pixel units
    const camPosRightPx = camPosRight / pixelWidth;
    const camPosUpPx = camPosUp / pixelHeight;

    // 3. Find the fractional pixel units and convert to world units
    const fractX = camPosRightPx - Math.round( camPosRightPx );
    const fractY = camPosUpPx - Math.round( camPosUpPx );

    // 4. Add fractional world units to the left/right top/bottom to align with the pixel grid
    camera.left = - aspectRatio - ( fractX * pixelWidth );
    camera.right = aspectRatio - ( fractX * pixelWidth );
    camera.top = 1.0 - ( fractY * pixelHeight );
    camera.bottom = - 1.0 - ( fractY * pixelHeight );
    camera.updateProjectionMatrix();

}