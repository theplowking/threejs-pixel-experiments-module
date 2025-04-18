import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import { Water } from 'three/examples/jsm/objects/Water2.js';

// Initialize simplex noise function
const noise3D = createNoise3D();

let water;

let params = {
    color: '#ffffff',
    scale: 4,
    flowX: 1,
    flowY: 1,
    size: 500,
    resolution: 256,
    waveHeight: 1,
    waveSpeed: 0.0005,
    waveScale: 20
};

export function setup(scene, gui, scale, pos) {

    // Create a higher resolution plane for the ocean
    const geometry = new THREE.PlaneGeometry(
        params.size, 
        params.size, 
        params.resolution, 
        params.resolution
      );

      water = new Water( geometry, {
              color: params.color,
              scale: params.scale,
              flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
              textureWidth: 1024,
              textureHeight: 1024,
              flowSpeed: 0.01,
              //reflectivity: 0.05
          } );
      
      // Create a more visible material for the ocean
      const material = new THREE.MeshPhongMaterial({
        color: 0x0077be,         // Deep blue color
        specular: 0x99ccff,      // Light blue specular highlights
        shininess: 30,           // More pronounced highlights
        transparent: true,
        opacity: 0.3,            // Slightly increased opacity
        side: THREE.DoubleSide,  // Visible from both sides
        flatShading: true        // Make polygons flat instead of smooth
      });
      
     // water = new THREE.Mesh(geometry, material);
      water.rotation.x = -Math.PI / 2;
      
      // Receive shadows for better realism
      water.receiveShadow = true;
      
      // Position the water
      water.position.set(0, pos,0);

    scene.add( water );

    //add gui

    // const waterFolder = gui.addFolder('Water');

    // waterFolder.addColor( params, 'color' ).onChange( function ( value ) {

    //     water.material.uniforms[ 'color' ].value.set( value );

    // } );
    // waterFolder.add( params, 'scale', 1, 10 ).onChange( function ( value ) {

    //     water.material.uniforms[ 'config' ].value.w = value;

    // } );
    // waterFolder.add( params, 'flowX', - 1, 1 ).step( 0.01 ).onChange( function ( value ) {

    //     water.material.uniforms[ 'flowDirection' ].value.x = value;
    //     water.material.uniforms[ 'flowDirection' ].value.normalize();

    // } );
    // waterFolder.add( params, 'flowY', - 1, 1 ).step( 0.01 ).onChange( function ( value ) {

    //     water.material.uniforms[ 'flowDirection' ].value.y = value;
    //     water.material.uniforms[ 'flowDirection' ].value.normalize();

    // } );

    // waterFolder.close();

}

export function update(delta) {

    var time = performance.now() * params.waveSpeed;

    // Update plane - use world coordinates
    const vertices = water.geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        // Convert local to world coordinates
        const localPoint = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
        const worldPoint = water.localToWorld(localPoint.clone());
        
        // Use world X and Z for noise
        const height = getHeightAt(worldPoint.x, worldPoint.z, time);
        vertices[i + 2] = height; // Set Y in local coordinates (becomes world Y after rotation)
    }
    water.geometry.attributes.position.needsUpdate = true;
    
    // Update normals for correct lighting
    water.geometry.computeVertexNormals();

}

 // Get wave height at any world position
 function getHeightAt(x, z, time) {

    //return this.noise3D(x * 0.1, z * 0.1, this.time);

    // Scale coordinates to adjust wave frequency
    const nx = x / params.waveScale;
    const nz = z / params.waveScale;
    
    // Use Perlin noise to calculate height
    let height = 0;
    
    // Add multiple octaves of noise for more natural waves
    height += noise3D(nx * 1.0, time * 0.5, nz * 1.0) * 0.5;
    height += noise3D(nx * 2.0, time * 0.4, nz * 2.0) * 0.25;
    height += noise3D(nx * 4.0, time * 0.3, nz * 4.0) * 0.125;
    
    // Scale by wave height parameter
    return height * params.waveHeight;
  }
  
  // Get the wave height at a specific world position (for buoyancy)
  export function getWaterHeightAt(x, z, time) {
    // Clamp position to the ocean bounds
    const clampedX = Math.max(Math.min(x, params.size/2), -params.size/2);
    const clampedZ = Math.max(Math.min(z, params.size/2), -params.size/2);
    
    // Get height at this position
    const height = getHeightAt(clampedX, clampedZ, time);
    
    // Since the mesh is rotated, the height value becomes the Y coordinate in world space
    return height;
  }


