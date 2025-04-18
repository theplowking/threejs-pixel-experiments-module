
import * as THREE from 'three';
import { WaterShader } from '../shaders/water/water_shader.js';

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

export function setup(scene, gui, scale, pos, environmentMap) {

    water = new THREE.Mesh();

    water.material = new THREE.ShaderMaterial({
        vertexShader: WaterShader.vertexShader,
        fragmentShader: WaterShader.fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0.8 },
          uEnvironmentMap: { value: environmentMap },
          uWavesAmplitude: { value: 1 },
          uWavesFrequency: { value: 0.2 },
          uWavesPersistence: { value: 0.3 },
          uWavesLacunarity: { value: 2.18 },
          uWavesIterations: { value: 4 },
          uWavesSpeed: { value: 0.2 },
          uTroughColor: { value: new THREE.Color('#186691') },
          uSurfaceColor: { value: new THREE.Color('#9bd8c0') },
          uPeakColor: { value: new THREE.Color('#bbd8e0') },
          uPeakThreshold: { value: 0.08 },
          uPeakTransition: { value: 0.05 },
          uTroughThreshold: { value: -0.01 },
          uTroughTransition: { value: 0.15 },
          uFresnelScale: { value: 0.8 },
          uFresnelPower: { value: 0.5 }
        },
        transparent: true,
        depthTest: true,
        side: THREE.DoubleSide
      });
  
      water.geometry = new THREE.PlaneGeometry(1000,1000, params.resolution || 512, params.resolution || 512);
      water.rotation.x = Math.PI * 0.5;
      water.position.y = 0;
    
    scene.add( water );

}



export function update(delta) {

    water.material.uniforms[ 'uTime' ].value += delta;

}