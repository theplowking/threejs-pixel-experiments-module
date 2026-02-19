import * as THREE from 'three';
import { SimplifyModifier } from 'three/addons/modifiers/SimplifyModifier.js';

//import { CausticsShader } from '../shaders/water/caustics_shader_flat.js';
import { CausticsShader } from '../shaders/water/caustics_shader_flat_oncompile.js';


//const terrainTexture = new THREE.TextureLoader().load('../textures/tex_island.png');
const terrainTexture = new THREE.TextureLoader().load('../textures/map2.jpg');

let groundCaustics, groundMat, groundCausticsStandard;

export function setup(scene) {


    const groundGeoIndexed = new THREE.PlaneGeometry(1000, 1000, 512, 512);

    // First apply randomness to the indexed geometry so shared vertices get the same offset
    const indexedVerts = groundGeoIndexed.attributes.position;
    const randomnessScale = 2.0;
    
    // Create consistent random offsets for each unique vertex position
    const vertexOffsets = new Map();
    
    for (let i = 0; i < indexedVerts.count; i++) {
        const x = indexedVerts.getX(i);
        const y = indexedVerts.getY(i);
        const key = `${x.toFixed(6)},${y.toFixed(6)}`;
        
        if (!vertexOffsets.has(key)) {
            // Generate random offset for this unique position
            const randomX = (Math.random() - 0.5) * randomnessScale;
            const randomY = (Math.random() - 0.5) * randomnessScale;
            vertexOffsets.set(key, { x: randomX, y: randomY });
        }
        
        // Apply the consistent offset
        const offset = vertexOffsets.get(key);
        indexedVerts.setX(i, x + offset.x);
        indexedVerts.setY(i, y + offset.y);
    }
    indexedVerts.needsUpdate = true;

    // Convert to non-indexed geometry to break quad coplanarity
    const groundGeo = groundGeoIndexed.toNonIndexed();

    // Load the heightmap texture and set vertex heights after loading
    const loader = new THREE.TextureLoader();
    //loader.load('textures/heightmap_island.png', (disMap) => {
    loader.load('textures/heightmap2.png', (disMap) => {
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
            //verts.setZ(i, height - 60);
            verts.setZ(i, height + 2.2);
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
              uCausticsScale: { value: 200.0 },
              uCausticsSpeed: { value: 1.0 },
              uCausticsThickness: { value: 0.4 },
              uCausticsOffset: { value: 0.75 },
              uHeightMin: { value: 1 },
              uHeightMax: { value: 5 }
            }
          });

    groundCausticsStandard = new THREE.MeshStandardMaterial({
        map: terrainTexture,
        side: THREE.FrontSide,
        transparent: false,
        flatShading: true,
    });
    
    groundCausticsStandard.onBeforeCompile = (shader) => {
        // Add caustics uniforms
        shader.uniforms.uTime = { value: 0 };
        shader.uniforms.uCausticsColor = { value: new THREE.Color('#f7fdfd') };
        shader.uniforms.uCausticsIntensity = { value: 0.2 };
        shader.uniforms.uCausticsScale = { value: 500.0 };
        shader.uniforms.uCausticsSpeed = { value: 1.0 };
        shader.uniforms.uCausticsThickness = { value: 0.5 };
        shader.uniforms.uCausticsOffset = { value: 0.75 };
        shader.uniforms.uHeightMin = { value: 1 };
        shader.uniforms.uHeightMax = { value: 4.8 };

        // Store shader reference for updates
        groundCausticsStandard.userData.shader = shader;

        shader.vertexShader = CausticsShader.vertexShader;
        shader.fragmentShader = CausticsShader.fragmentShader;
    };
    
    

   const groundMesh = new THREE.Mesh(groundGeo, groundCausticsStandard);
   groundMesh.castShadow = true;
    groundMesh.receiveShadow = true;

    scene.add(groundMesh);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = 0;

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
    
    // Update the onBeforeCompile material uniforms if it exists
    if (groundCausticsStandard.userData.shader) {
        groundCausticsStandard.userData.shader.uniforms.uTime.value += delta;
    }
}