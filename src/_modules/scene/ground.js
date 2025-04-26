
import * as THREE from 'three';
import { CausticsShader } from '../shaders/water/caustics_shader.js';

const poolTexture = new THREE.TextureLoader().load('../textures/ocean_floor.png');

let groundMaterial;

export function setup(scene) {

    // const gridHelper = new THREE.GridHelper(20, 20, 0x555555, 0x555555)
    // scene.add(gridHelper)

    const groundGeometry = new THREE.PlaneGeometry( 100, 100 );
    
    // const groundMaterial = new THREE.MeshStandardMaterial( { roughness: 0.8, metalness: 0.4 } );
    // const textureLoader = new THREE.TextureLoader();
    // textureLoader.load( 'textures/hardwood2_diffuse.jpg', function ( map ) {

    //     map.wrapS = THREE.RepeatWrapping;
    //     map.wrapT = THREE.RepeatWrapping;
    //     map.anisotropy = 16;
    //     map.repeat.set( 4, 4 );
    //     map.colorSpace = THREE.SRGBColorSpace;
    //     groundMaterial.map = map;
    //     groundMaterial.needsUpdate = true;

    // } );

    groundMaterial = new THREE.ShaderMaterial({
        vertexShader: CausticsShader.vertexShader,
        fragmentShader: CausticsShader.fragmentShader,
        uniforms: {
          uTexture: { value: poolTexture },
          uTime: { value: 0 },
          uCausticsColor: { value: new THREE.Color('#ffffff') },
          uCausticsIntensity: { value: 0.2 },
          uCausticsScale: { value: 20.0 },
          uCausticsSpeed: { value: 1.0 },
          uCausticsThickness: { value: 0.4 },
          uCausticsOffset: { value: 0.75 }
        }
      });

      const ground = new THREE.Mesh( groundGeometry, groundMaterial );
      ground.rotation.x = Math.PI * - 0.5;
      scene.add( ground );

}

export function update(delta) {
    groundMaterial.uniforms[ 'uTime' ].value += delta;
}