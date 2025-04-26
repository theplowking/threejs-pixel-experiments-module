
import * as THREE from 'three';
import { SimplifyModifier } from 'three/addons/modifiers/SimplifyModifier.js';
import { CausticsShader } from '../shaders/water/caustics_shader.js';


const terrainTexture = new THREE.TextureLoader().load('../textures/map2.jpg');

let groundCaustics, groundMat;

export function setup(scene) {


    const groundGeo = new THREE.PlaneGeometry(1000, 1000, 512, 512);

    // Load the heightmap texture and set vertex heights after loading
    const loader = new THREE.TextureLoader();
    loader.load('textures/heightmap.png', (disMap) => {
        // Create a canvas to extract pixel data
        const img = disMap.image;
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height).data;

        // Set vertex heights based on pixel data
        const verts = groundGeo.attributes.position;
        for (let i = 0; i < verts.count; i++) {
            // Get uv for this vertex
            const u = groundGeo.attributes.uv.getX(i);
            const v = groundGeo.attributes.uv.getY(i);
            // Map uv to pixel
            const x = Math.floor(u * (img.width - 1));
            const y = Math.floor((1 - v) * (img.height - 1));
            const idx = (y * img.width + x) * 4;
            const pixel = imgData[idx]; // R channel (greyscale)
            // Scale pixel to height (0-255 to e.g. 0-100)
            const scale = 100;
            const height = (pixel / 255) * scale;
            verts.setZ(i, height);
        }
        verts.needsUpdate = true;
        groundGeo.computeVertexNormals();
    });

    groundMat = new THREE.MeshStandardMaterial({
        wireframe: false,
        // No displacementMap or displacementScale
        receiveShadow: true
    });

    groundCaustics = new THREE.ShaderMaterial({
            vertexShader: CausticsShader.vertexShader,
            fragmentShader: CausticsShader.fragmentShader,
            uniforms: {
              uTexture: { value: terrainTexture },
              uTime: { value: 0 },
              uCausticsColor: { value: new THREE.Color('#ffffff') },
              uCausticsIntensity: { value: 0.2 },
              uCausticsScale: { value: 50.0 },
              uCausticsSpeed: { value: 1.0 },
              uCausticsThickness: { value: 0.4 },
              uCausticsOffset: { value: 0.75 },
              uHeightMin: { value: -2.0 },
              uHeightMax: { value: -0.5 }
            },
          });

   const groundMesh = new THREE.Mesh(groundGeo, groundCaustics);
   
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

    // const textureLoader = new THREE.TextureLoader();
    //     textureLoader.load( 'textures/map2.jpg', function ( map ) {
    
    //         //map.wrapS = THREE.RepeatWrapping;
    //         //map.wrapT = THREE.RepeatWrapping;
    //         //map.anisotropy = 16;
    //         //map.repeat.set( 4, 4 );
    //         //map.colorSpace = THREE.SRGBColorSpace;
    //         groundMat.map = map;
    //         groundMat.needsUpdate = true;
    
    //     } );

}


export function update(delta) {
    groundCaustics.uniforms[ 'uTime' ].value += delta;
}