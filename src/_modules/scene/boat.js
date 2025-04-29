import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Internal boat state
let boat = null;
let world = null;

// Debug spheres for water height at corners
let debugSpheres = [];

// Controls state (singleton for all boats)
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};
let controlsSetup = false;

function setupControls() {
    if (controlsSetup) return;
    controlsSetup = true;
    document.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
    });
    document.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
    });
}

/**
 * Setup the boat and add to scene and physics world
 * @param {THREE.Scene} scene
 * @param {object} water - must have getWaterHeightAt(x, z)
 * @param {CANNON.World} cannonWorld
 * @param {THREE.Vector3} [position]
 */
export async function setup(scene, water, cannonWorld, position = new THREE.Vector3(0, 2, 0)) {
    world = cannonWorld;
    setupControls();
    

    // var loader = new GLTFLoader();
    //     loader.load(
    //         // resource URL
    //         'models/pilot_schooner.glb',
    //         //'models/ballycarbery_castle_ruin_scale.glb',
    //         // called when the resource is loaded 
    //         function ( gltf ) {
    
    //             var mesh = gltf.scene;
    //             mesh.scale.set(0.2, 0.2, 0.2);
    //             mesh.castShadow = true;
    //             mesh.receiveShadow = true;
    //             mesh.position.copy(position);
    //             console.log(mesh);

    //             // Create physics body
    //             const body = new CANNON.Body({
    //                 mass: 10,
    //                 position: new CANNON.Vec3(position.x, position.y, position.z),
    //                 angularDamping: 0.8,
    //                 linearDamping: 0.3
    //             });
    //             body.addShape(new CANNON.Box(new CANNON.Vec3(1, 0.5, 2)));

    //             // Store references
    //             boat = { mesh, body, water };

    //             // Add to scene and world
    //             scene.add(mesh);
    //             world.addBody(body);
    //         }
    //     );

    // Create mesh
    const boatGeometry = new THREE.BoxGeometry(2, 1, 4);
    const boatMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
    const mesh = new THREE.Mesh(boatGeometry, boatMaterial);

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.copy(position);
    //console.log(mesh);

    // Create physics body
    const body = new CANNON.Body({
        mass: 10,
        position: new CANNON.Vec3(position.x, position.y, position.z),
        angularDamping: 0.8,
        linearDamping: 0.3
    });
    body.addShape(new CANNON.Box(new CANNON.Vec3(1, 0.5, 2)));

    // Store references
    boat = { mesh, body, water };

    // Add to scene and world
    scene.add(mesh);
    world.addBody(body);

    // Create debug spheres for water surface at corners
    if (debugSpheres.length === 0) {
        const sphereGeo = new THREE.SphereGeometry(0.15, 16, 16);
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0x3388ff, transparent: true, opacity: 0.6 });
        for (let i = 0; i < 4; i++) {
            const s = new THREE.Mesh(sphereGeo, sphereMat.clone());
            scene.add(s);
            debugSpheres.push(s);
        }
    }
}

async function loadModel() {
    // Load a glTF resource
        var loader = new GLTFLoader();
        loader.load(
            // resource URL
            'models/pilot_schooner.glb',
            //'models/ballycarbery_castle_ruin_scale.glb',
            // called when the resource is loaded 
            function ( gltf ) {
    
                var model = gltf.scene;
    
                // Scale the model
                model.scale.set(100,100,100);
                //model.scale.set(4,4,2);
                
                //model.rotation.y = Math.PI ; // 90 degrees in radians
                // Enable shadows for the loaded model
                
                //model.children[0].geometry.center();
    
                const box = new THREE.Box3( ).setFromObject( model );
                const c = box.getCenter( new THREE.Vector3( ) );
                const size = box.getSize( new THREE.Vector3( ) );
                //model.position.set( -c.x, size.y / 2 - c.y, -c.z ); // center the gltf scene
                
                //model.position.set(-52, 115, -1157.630);
                return model;
            }
        );
}

/**
 * Update the boat physics and sync mesh
 * @param {number} delta - time step (seconds)
 */
export function update(delta) {
    if (!boat) return;
    const { mesh, body, water } = boat;
    // Buoyancy at four corners
    const corners = [
        new CANNON.Vec3(-1, -0.5, -2),
        new CANNON.Vec3(1, -0.5, -2),
        new CANNON.Vec3(-1, -0.5, 2),
        new CANNON.Vec3(1, -0.5, 2)
    ];
    corners.forEach((corner, i) => {
        const worldPoint = body.position.vadd(body.quaternion.vmult(corner));
        let waterHeight = 0;
        waterHeight = water.getWaterHeightAt(worldPoint.x, worldPoint.z);
        
        // Update debug sphere position
        if (debugSpheres[i]) {
            debugSpheres[i].position.set(worldPoint.x, waterHeight, worldPoint.z);
        }

        const depth = waterHeight - worldPoint.y;
        if (depth > 0) {
            const buoyancyForce = depth * 40;
            const force = new CANNON.Vec3(0, buoyancyForce, 0);
            body.applyLocalForce(force, corner);
        }
    });
    // Controls
    const forwardForce = 50;
    const turnForce = 25;
    if (keys.ArrowUp) {
        body.applyLocalForce(new CANNON.Vec3(0, 0, -forwardForce), new CANNON.Vec3(0, 0, 0));
    }
    if (keys.ArrowDown) {
        body.applyLocalForce(new CANNON.Vec3(0, 0, forwardForce), new CANNON.Vec3(0, 0, 0));
    }
    if (keys.ArrowLeft) {
        body.applyTorque(new CANNON.Vec3(0, turnForce, 0));
    }
    if (keys.ArrowRight) {
        body.applyTorque(new CANNON.Vec3(0, -turnForce, 0));
    }
    // Drag
    const velocity = body.velocity;
    const localVel = body.quaternion.inverse().vmult(velocity);
    const lateralDrag = -30;
    const sideForce = new CANNON.Vec3(localVel.x * lateralDrag, 0, 0);
    body.applyLocalForce(sideForce, new CANNON.Vec3(0, 0, 0));
    const longitudinalDrag = -5;
    const forwardForceResistance = new CANNON.Vec3(0, 0, localVel.z * longitudinalDrag);
    body.applyLocalForce(forwardForceResistance, new CANNON.Vec3(0, 0, 0));
    // Sync mesh
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
}
