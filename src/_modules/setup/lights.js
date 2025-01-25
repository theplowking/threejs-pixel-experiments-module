
import * as THREE from 'three';

import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';

let params = {
    AmbLight:  new THREE.Color(0xe7e7e7),
    DirLight:  new THREE.Color(0xc2c2c2),
};

let lighteningLight;

export function setup(scene,gui) {

    // const hemisphere_light = new THREE.HemisphereLight( 0xffffff, 0x222222, .8 ) 
    // hemisphere_light.position.set( 0,1,0 )
    // scene.add( hemisphere_light )

    // const directional_light = new THREE.DirectionalLight( 0xffffff, 1 )
    // directional_light.position.set( -1, 10, 0 )
    // directional_light.castShadow = true

    // const shadow_camera_length = 20;
    // directional_light.shadow.mapSize.width = 4096
    // directional_light.shadow.mapSize.height = 4096
    // directional_light.shadow.radius = 5
    // directional_light.shadow.bias = - 0.00006
    // directional_light.shadow.camera.near = 1
    // directional_light.shadow.camera.far = 14
    // directional_light.shadow.camera.left = -shadow_camera_length;
    // directional_light.shadow.camera.right = shadow_camera_length;
    // directional_light.shadow.camera.top = shadow_camera_length;
    // directional_light.shadow.camera.bottom = -shadow_camera_length;

    // scene.add( directional_light )

    // const hemisphere_light_helper = new THREE.HemisphereLightHelper( hemisphere_light, 5 )
    // scene.add( hemisphere_light_helper )

    // const directional_light_helper = new THREE.DirectionalLightHelper( directional_light, 5 )
    // scene.add( directional_light_helper )

    // const directional_light_shadow_helper = new THREE.CameraHelper(directional_light.shadow.camera)
    // scene.add(directional_light_shadow_helper)

    const ambientLight = new THREE.AmbientLight( 0xe7e7e7, 1 );
    scene.add( ambientLight );

    const directionalLight = new THREE.DirectionalLight( 0xe0e0e0, 4 );
    directionalLight.position.set( - 1, 1, -0.16 );
    scene.add( directionalLight );

    //lightening
    lighteningLight = new THREE.DirectionalLight( 0xffffff, 5 );
    lighteningLight.position.set( - 1, 1, -1 );
    //scene.add( lighteningLight );

    setupGUI(gui, ambientLight, directionalLight);

}

function setupGUI(gui, ambientLight, directionalLight){

    var folder = gui.addFolder('Colour');
			
			folder.addColor(params, 'AmbLight')
				.name('Ambient Color')
				.onChange(function() {
					ambientLight.color.set(params.AmbLight);
				});
			folder.add( ambientLight, 'intensity', 0, 1, 0.05 ).name( 'Ambient int' );

			// folder.addColor(params, 'PtLight')
			// 	.name('Pt Color')
			// 	.onChange(function() {
			// 		light.color.set(params.PtLight);
			// 	});
			// folder.add( light, 'intensity', 0, 1, 0.05 ).name( 'Pt int' );

			folder.addColor(params, 'DirLight')
				.name('Dir Color')
				.onChange(function() {
					directionalLight.color.set(params.DirLight);
				});
			folder.add( directionalLight, 'intensity', 0, 5, 0.1 ).name( 'Dir int' );
			
			folder.open();

			var folderDir = gui.addFolder('Direction');
				folderDir.add( directionalLight.position, 'x', -20, 20 );
				folderDir.add( directionalLight.position, 'y', -20, 20 );
				folderDir.add( directionalLight.position, 'z', -20, 20 );
				folderDir.open();

}

export function update(delta) {

    var time = performance.now()*0.0005;

    let intensity = THREE.MathUtils.clamp(new ImprovedNoise().noise(time,1,1)+0.5, 0.7, 1) - 0.7; //from 0 to 0.1
    intensity=intensity*20;

    //console.log (intensity, intensity > 0 ? intensity + 2 : 0);

    lighteningLight.intensity = intensity > 0 ? intensity + 2 : 0;

}

// Define the flicker animation
function flickerAnimation(time) {
    // Randomly adjust the intensity and distance of the light
    const intensity = (new ImprovedNoise().noise(time, 0, 0) * 40) + 30; //THREE.MathUtils.randFloat(0.8, 1.0);
    const distance = (new ImprovedNoise().noise(time, 0, 0) * 10) + 45;
    light.intensity = intensity;
    //light.distance = distance;
    var range = 0.5;
    light.position.set( particleFireMesh0.position.x + (new ImprovedNoise().noise(time*2, 0, 0) * range) - (range*2),
                        particleFireMesh0.position.y + (new ImprovedNoise().noise(0, time*2, 0) * range) - (range*2),
                        particleFireMesh0.position.z + (new ImprovedNoise().noise(0, 0, time*2) * range) - (range*2) );

};
