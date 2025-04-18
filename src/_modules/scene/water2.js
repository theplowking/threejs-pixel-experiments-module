
import * as THREE from 'three';

import { Water } from 'three/examples/jsm/objects/Water2.js';

import { WaterShader } from '../shaders/water/water_combo.js';

let water;

let params = {
    color: '#ffffff',
    scale: 10,
    flowX: 1,
    flowY: 1
};

export function setup(scene, gui, scale, pos) {

    const waterGeometry = new THREE.PlaneGeometry( scale, scale, 512, 512 );

    water = new Water( waterGeometry, {
        color: params.color,
        scale: params.scale,
        flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
        textureWidth: 1024,
        textureHeight: 1024,
        flowSpeed: 0.01,
        reflectivity: 0.02,
        shader: WaterShader,
    } );

    //water.material.flatShading = true;
    //water.material.wireframe = true;
    //water.position.y = 1;
    water.position.set(0, pos,0);
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

export function update(delta) {
    water.material.uniforms[ 'uTime' ].value += delta;
}

