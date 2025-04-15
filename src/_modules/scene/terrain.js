
import * as THREE from 'three';
import { SimplifyModifier } from 'three/addons/modifiers/SimplifyModifier.js';

export default function terrain(scene) {


    const groundGeo = new THREE.PlaneGeometry(1000, 1000, 128, 128);

    let disMap = new THREE.TextureLoader().load('textures/heightmap.png'); // heightmap filename from dat.gui choice

    // horizontal    vertical texture can repeat on object surface
    disMap.wrapS = disMap.wrapT = THREE.RepeatWrapping;
    //disMap.repeat.set(sliders.horTexture, sliders.vertTexture); // # horizontal & vertical textures

    const groundMat = new THREE.MeshStandardMaterial({
        //color: 0x000000,
        wireframe: false,
        displacementMap: disMap, // affects position of mesh vertices, white = highest, black = lowest
        displacementScale: 100, // how much disMap affects mesh (def = 1)
        flatShading: true,
        receiveShadow: true
    });

   const groundMesh = new THREE.Mesh(groundGeo, groundMat);
   
    scene.add(groundMesh);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.5;

    // const modifier = new SimplifyModifier();

	// 				const simplified = groundMesh.clone();
	// 				simplified.material = simplified.material.clone();
	// 				simplified.material.flatShading = true;
	// 				const count = Math.floor( simplified.geometry.attributes.position.count * 0.875 ); // number of vertices to remove
	// 				simplified.geometry = modifier.modify( simplified.geometry, count );

	// 				simplified.position.y = -0.5;
	// 				simplified.rotation.x = - Math.PI / 2;
	// 				scene.add( simplified );


    
    
    const textureLoader = new THREE.TextureLoader();
        textureLoader.load( 'textures/map.png', function ( map ) {
    
            //map.wrapS = THREE.RepeatWrapping;
            //map.wrapT = THREE.RepeatWrapping;
            //map.anisotropy = 16;
            //map.repeat.set( 4, 4 );
            //map.colorSpace = THREE.SRGBColorSpace;
            groundMat.map = map;
            groundMat.needsUpdate = true;
    
        } );

}


