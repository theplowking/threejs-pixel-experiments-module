import * as THREE from 'three';

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function modelGTLF(scene) {

    // Load a glTF resource
    var loader = new GLTFLoader();
    loader.load(
        // resource URL
        //'models/an_afternoon_in_a_persian_garden.glb',
        'models/ballycarbery_castle_ruin_scale.glb',
        // called when the resource is loaded 
        function ( gltf ) {

            var model = gltf.scene;

            // Scale the model
            //model.scale.set(0.01, 0.01, 0.01);
            //model.scale.set(4,4,2);
            
            //model.rotation.y = Math.PI ; // 90 degrees in radians
            // Enable shadows for the loaded model
            
            //model.children[0].geometry.center();

            const box = new THREE.Box3( ).setFromObject( model );
            const c = box.getCenter( new THREE.Vector3( ) );
            const size = box.getSize( new THREE.Vector3( ) );
            //model.position.set( -c.x, size.y / 2 - c.y, -c.z ); // center the gltf scene
            
            //model.position.set(-52, 115, -1157.630);

            model.traverse(function (child) {
                //console.log(child.material);
                //if ( child.material ) child.material.metalness = 0;
                if (child.isMesh) {

                    var prevMaterial = child.material;
                    child.material = new THREE.MeshStandardMaterial({ flatShading: true });
                    THREE.MeshBasicMaterial.prototype.copy.call( child.material, prevMaterial );

                    child.material.metalness = 0;

                    // Check if the material has an 'emissive' property
                    // if (child.material.emissive !== undefined) {
                    //     child.material.emissive = new THREE.Color(0xffffff); // Set an emissive color if needed
                    // }
                    
                    // Ensure the material receives and interacts with light
                    //child.material.side = THREE.DoubleSide; // Set the side of the material
        
                    child.castShadow = true; // Enable shadow casting
                    child.receiveShadow = true; // Enable shadow receiving
                }
            });

            // Add the scaled model to the scene
            scene.add(model);

        }
    );

}