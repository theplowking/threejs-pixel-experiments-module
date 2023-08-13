
import * as THREE from 'three';

import { Water } from 'three/examples/jsm/objects/Water2.js';

let water;

let params = {
    color: '#ffffff',
    scale: 4,
    flowX: 1,
    flowY: 1
};

export default function water2(scene, gui) {

    const waterGeometry = new THREE.PlaneGeometry( 20, 20 );

    water = new Water( waterGeometry, {
        color: params.color,
        scale: params.scale,
        flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
        textureWidth: 1024,
        textureHeight: 1024
    } );

    water.position.y = 1;
    water.rotation.x = Math.PI * - 0.5;
    scene.add( water );

    //add gui

    const waterFolder = gui.addFolder('Water');

    waterFolder.addColor( params, 'color' ).onChange( function ( value ) {

        water.material.uniforms[ 'color' ].value.set( value );

    } );
    waterFolder.add( params, 'scale', 1, 10 ).onChange( function ( value ) {

        water.material.uniforms[ 'config' ].value.w = value;

    } );
    waterFolder.add( params, 'flowX', - 1, 1 ).step( 0.01 ).onChange( function ( value ) {

        water.material.uniforms[ 'flowDirection' ].value.x = value;
        water.material.uniforms[ 'flowDirection' ].value.normalize();

    } );
    waterFolder.add( params, 'flowY', - 1, 1 ).step( 0.01 ).onChange( function ( value ) {

        water.material.uniforms[ 'flowDirection' ].value.y = value;
        water.material.uniforms[ 'flowDirection' ].value.normalize();

    } );

    waterFolder.close();

}


