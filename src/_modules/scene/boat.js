import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Internal boat state
let boat, sail;
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

    // Create mast mesh (visual representation)
    const mastGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
    const mastMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const mastMesh = new THREE.Mesh(mastGeometry, mastMaterial);
    
    // Position the mast at the center of the boat, with the bottom at the boat's deck
    mastMesh.position.set(0, 1.5, 0);
    
    // Add the mast directly to the boat mesh so it moves with the boat
    mesh.add(mastMesh);

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.copy(position);
    //console.log(mesh);

    // Create physics body
    const body = new CANNON.Body({
        mass: 8,
        position: new CANNON.Vec3(position.x, position.y, position.z),
        angularDamping: 0.99,
        linearDamping: 0.3
    });
    body.addShape(new CANNON.Box(new CANNON.Vec3(1, 0.5, 2)));

    // Store references
    boat = { mesh, body, water };

    // Add to scene and world
    scene.add(mesh);
    world.addBody(body);

    //add keel
    createVirtualKeel(body, world, position);

    //add sail
    createSail(body, world, position, scene);

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

function createVirtualKeel(boat, world, position) {
    // Create a separate physics body for the keel weight
    const keelShape = new CANNON.Sphere(0.3);
    const keelBody = new CANNON.Body({
      mass: 2, // Make the keel heavier than the hull
      position: new CANNON.Vec3(position.x, position.y - 1, position.z), // Position below the hull
      shape: keelShape,
      angularDamping: 0.99,
      linearDamping: 0.3
    });
    
    // Add the keel body to the physics world
    world.addBody(keelBody);
    
    // Create a constraint to connect the hull and keel
    // This will make them move together as one rigid body
    const constraint = new CANNON.LockConstraint(
      boat, 
      keelBody, 
      {
        maxForce: 1e6 // Use a high max force to keep the constraint rigid
      }
    );
    
    // Add the constraint to the physics world
    world.addConstraint(constraint);
  }

  function createSail(boatBody, world, position, scene) {
    // Create a triangular sail
    const sailShape = new THREE.Shape();
    sailShape.moveTo(0, 0);
    sailShape.lineTo(0, 2.5); // Height of the sail (along mast)
    sailShape.lineTo(1.5, 0); // Width of sail at bottom
    sailShape.lineTo(0, 0); // Back to origin to close shape
    
    const sailGeometry = new THREE.ShapeGeometry(sailShape);
    const sailMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFFFFF,
      side: THREE.DoubleSide // Make the sail visible from both sides
    });
    
    const sailMesh = new THREE.Mesh(sailGeometry, sailMaterial);
    
    // Position the sail at the mast
    sailMesh.position.set(position.x, position.y + 0.5, position.z);
    
    // Rotate the sail to be perpendicular to the boat
    //sailMesh.rotation.y = Math.PI / 2;
    
    // We'll add the sail to the scene directly since it needs to rotate independently
    scene.add(sailMesh);
    
    // Create physics body for the sail
    // We'll use a simple box shape for physics
    const sailShape3D = new CANNON.Box(new CANNON.Vec3(0.05, 1.25, 0.75));
    
    const sailBody = new CANNON.Body({
      mass: 0.1, // Light weight
      position: new CANNON.Vec3(0, 1.75, 0), // Position relative to boat
      shape: sailShape3D
    });
    
    // Restrict rotation to only around the Y axis (the mast)
    //this.bodies.sail.angularFactor.set(0, 1, 0);
    
    world.addBody(sailBody);

    sail = {sailMesh, sailBody};

    // Create Hinge
    createHinge(world, boatBody, sailBody);
  }

function createHinge(world, boatBody, sailBody) {
   
    const localYAxis = new CANNON.Vec3(0, 1, 0);

    const hingeConstraint = new CANNON.HingeConstraint(
      boatBody, // bodyA (the boat)
      sailBody, // bodyB (the sail)
      {
        pivotA: new CANNON.Vec3(0, 2.5, 0),   // mast bottom
        pivotB: new CANNON.Vec3(0, 2, 0),    // mast top
        axisA: localYAxis, // Axis of rotation on the boat (mast direction)
        axisB: localYAxis // Axis of rotation on the sail (mast direction)
      }
    );
    
    // Add the constraint to the physics world
    world.addConstraint(hingeConstraint);
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
    // if (keys.ArrowDown) {
    //     body.applyLocalForce(new CANNON.Vec3(0, 0, forwardForce), new CANNON.Vec3(0, 0, 0));
    // }
    if (keys.ArrowDown) {
        body.applyLocalForce(new CANNON.Vec3(forwardForce, 0, 0), new CANNON.Vec3(0, 2, 0));
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

    sail.sailMesh.position.copy(sail.sailBody.position);
    sail.sailMesh.quaternion.copy(sail.sailBody.quaternion);

}
