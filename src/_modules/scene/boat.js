import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Internal boat state
let boat, sail;
let world = null;

// Wind parameters (exposed to GUI)
export const wind = {
    speed: 0, // wind speed (force magnitude)
    direction: 0 // wind direction in degrees (0 = +Z, 90 = +X)
};

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

    createStoppers(body, world, position, 1);
    createStoppers(body, world, position, -1);

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

function createStoppers(boat, world, position, offset) {
  // Create a separate physics body for the keel weight
  const stopperShape = new CANNON.Sphere(0.5);
  const stopperBody = new CANNON.Body({
    mass: 1, // Make the keel heavier than the hull
    position: new CANNON.Vec3(position.x + offset, position.y + 1, position.z -1), // Position below the hull
    shape: stopperShape,
    angularDamping: 0.99,
    linearDamping: 0.3
  });
  
  // Add the keel body to the physics world
  world.addBody(stopperBody);
  
  // Create a constraint to connect the hull and keel
  // This will make them move together as one rigid body
  const constraint = new CANNON.LockConstraint(
    boat, 
    stopperBody, 
    {
      maxForce: 1e6 // Use a high max force to keep the constraint rigid
    }
  );
  
  // Add the constraint to the physics world
  world.addConstraint(constraint);
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

  // Debug lines for wind, lift, drag
let windLine = null, liftLine = null, dragLine = null, forwardForceLine = null;

function createSail(boatBody, world, position, scene) {
    // Create a triangular sail
    const sailShape = new THREE.Shape();
    sailShape.moveTo(0, -1);
    sailShape.lineTo(0, 2.5); // Height of the sail (along mast)
    sailShape.lineTo(1.5, -1); // Width of sail at bottom
    sailShape.lineTo(0, -1); // Back to origin to close shape
    
    const sailGeometry = new THREE.ShapeGeometry(sailShape);
    sailGeometry.rotateY(Math.PI / 2);
    const sailMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFFFFF,
      side: THREE.DoubleSide // Make the sail visible from both sides
    });
    
    const sailMesh = new THREE.Mesh(sailGeometry, sailMaterial);
    
    // Position the sail at the mast
    sailMesh.position.set(position.x, position.y - 2, position.z);
    
    // Rotate the sail to be perpendicular to the boat
    //sailMesh.rotation.y = Math.PI / 2;
    
    // We'll add the sail to the scene directly since it needs to rotate independently
    scene.add(sailMesh);
    
    // Create physics body for the sail
    // We'll use a simple box shape for physics
    const sailShape3D = new CANNON.Box(new CANNON.Vec3(0.05, 1.25, 2));
    
    const sailBody = new CANNON.Body({
      mass: 0.1, // Light weightposition: new CANNON.Vec3(0, 2.5, -1), // Position relative to boat
      //position: new CANNON.Vec3(0, 2.5, 0),
      shape: sailShape3D
    });
    
    // Restrict rotation to only around the Y axis (the mast)
    //this.bodies.sail.angularFactor.set(0, 1, 0);
    
    world.addBody(sailBody);

    sail = {sailMesh, sailBody};

    // Create Hinge
  createHinge(world, boatBody, sailBody);

  // Helper to create a line
  function makeLine(color) {
    const mat = new THREE.LineBasicMaterial({ color });
    const geom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 2, 0)
    ]);
    return new THREE.Line(geom, mat);
  }
  windLine = makeLine(0x3388ff); // blue
  liftLine = makeLine(0x33ff33); // green
  dragLine = makeLine(0xff3333); // red
  forwardForceLine = makeLine(0xffff00); // yellow for forward force
  scene.add(windLine, liftLine, dragLine, forwardForceLine);
}

function createHinge(world, boatBody, sailBody) {
   
    const localYAxis = new CANNON.Vec3(0, 1, 0);

    const hingeConstraint = new CANNON.HingeConstraint(
      boatBody, // bodyA (the boat)
      sailBody, // bodyB (the sail)
      {
        pivotA: new CANNON.Vec3(0, 2, 0),   // mast bottom
        pivotB: new CANNON.Vec3(0, 0, 0),    // mast top
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


    // Wind force
    


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

    // --- Sail Forces & Debug Lines ---
    if (sail && sail.sailBody && windLine && liftLine && dragLine && forwardForceLine) {
        // Wind direction in radians (convert from degrees)
        const windDirRad = wind.direction * Math.PI / 180;

        // Wind vector (scale for visibility)
        const windVec = new THREE.Vector3(Math.sin(windDirRad), 0, Math.cos(windDirRad)).multiplyScalar(wind.speed * 0.2);
        

        // Get sail angle (assume Y-axis rotation)
        const sailQuat = sail.sailBody.quaternion;
        const sailEuler = new CANNON.Vec3();
        sailQuat.toEuler(sailEuler, 'YZX'); // Yaw = sailEuler.y
        const sailAngle = sailEuler.y;

        // Calculate forces
        const { lift, drag, angleOfAttack } = calculateSailForces(wind.speed, windDirRad, sailAngle);
        // --- Apply lift force at 1/3 up the mast ---
        // Mast base position
        const mastBase = sail.sailBody.position;
        // Local offset (y-axis is up mast): 1/3 of 2.5m mast height
        const offsetLocal = new CANNON.Vec3(0, 1, -1);
        sail.sailBody.applyLocalForce(lift, offsetLocal);

        // Calculate component of lift in boat's forward direction and add to forward force
        const forwardWorld = body.quaternion.vmult(new CANNON.Vec3(0, 0, -1)).unit();
        const liftForwardMag = lift.dot(forwardWorld);
        const liftForwardVec = forwardWorld.scale(liftForwardMag*10);
        //body.applyLocalForce(liftForwardVec, new CANNON.Vec3(0, 0, 0));

        //body.applyLocalForce(new CANNON.Vec3(0, 0, -liftForwardMag * 10), new CANNON.Vec3(0, 0, 0));

        // --- Debug lines ---
        // Mast top in world coords
        const mastTop = new THREE.Vector3().copy(sail.sailBody.position);
        mastTop.y += 2.5; // Assume mast height

        //        const CoE = sail.sailBody.position.vadd(sail.sailBody.quaternion.vmult(offsetLocal));
        const CoE = new THREE.Vector3().copy(sail.sailBody.position);
        //CoE.add(offsetLocal);

        // Convert CANNON.Vec3 to THREE.Vector3 for lift/drag, scale for visibility
        const liftVec = new THREE.Vector3(lift.x, lift.y, lift.z).multiplyScalar(1);
        // Forward force vector (same as liftForwardVec, scale for visibility)
        const forwardForceVec = new THREE.Vector3(liftForwardVec.x, liftForwardVec.y, liftForwardVec.z).multiplyScalar(0.1);

        // Update line geometries
        windLine.geometry.setFromPoints([mastTop, mastTop.clone().add(windVec)]);
        liftLine.geometry.setFromPoints([CoE, CoE.clone().add(liftVec)]);
        forwardForceLine.geometry.setFromPoints([mastTop, mastTop.clone().add(forwardForceVec)]);
        //dragLine.geometry.setFromPoints([mastTop, mastTop.clone().add(dragVec)]);
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


/**
 * Calculate lift and drag forces on the sail due to wind
 * @param {number} windSpeed - wind speed (magnitude)
 * @param {number} windDir - wind direction (radians, 0 = +Z)
 * @param {number} sailAngle - sail orientation (radians, 0 = +Z)
 * @param {number} area - sail area (m^2)
 * @returns {{lift: CANNON.Vec3, drag: CANNON.Vec3, angleOfAttack: number}}
 */
export function calculateSailForces(windSpeed, windDir, sailAngle, area = 2.5) {
    // Air density (kg/m^3)
    const rho = 1.225 / 100; // div by 100 to reduce power
    // Relative wind angle to sail (angle of attack)
    const angleOfAttack = windDir - sailAngle;
    // console.log(
    //   `Wind Dir: ${windDir * 180 / Math.PI}°, Sail Angle: ${sailAngle * 180 / Math.PI}°, AoA: ${angleOfAttack * 180 / Math.PI}°`
    // );
    // Simplified coefficients (can be improved)
    const CL = Math.sin(2 * angleOfAttack); // Lift coefficient (max at ~45deg)
    const CD = 0.1 + 0.9 * Math.pow(Math.sin(angleOfAttack), 2); // Drag coefficient
    // Dynamic pressure
    const q = 0.5 * rho * windSpeed * windSpeed;
    // Lift and drag magnitudes
    const liftMag = q * area * CL;
    const dragMag = q * area * CD;
    // Wind direction unit vector (XZ plane)
    const windVec = new CANNON.Vec3(Math.sin(windDir), 0, Math.cos(windDir));

    // Perpendicular to wind (right-hand, +Y up)
    //const liftDir = new CANNON.Vec3(-windVec.z, 0, windVec.x); // 90deg CCW

    if(Math.abs(angleOfAttack) > (Math.PI * 1/2) && Math.abs(angleOfAttack) < (Math.PI * 3/2) ) {
        // If angle of attack is more than 90 degrees, flip lift direction
        //sailAngle += Math.PI; // Flip sail angle
        console.log("Flipping lift direction");
        //liftDir.negate();
    }


    const sailVec = new CANNON.Vec3(Math.sin(sailAngle), 0, Math.cos(sailAngle));

    const liftDir = new CANNON.Vec3(-sailVec.z, 0, sailVec.x); // 90deg CCW

    
    // Drag is along wind
    const dragDir = windVec.clone();
    // Final force vectors
    const lift = liftDir.scale(liftMag);
    const drag = dragDir.scale(dragMag);
    return { lift, drag, angleOfAttack };
}

export function setupGUI(gui) {
    const windFolder = gui.addFolder('Wind');
    windFolder.add(wind, 'speed', 0, 50, 0.1).name('Wind Speed');
    windFolder.add(wind, 'direction', 0, 359, 1).name('Wind Direction (deg)');
    windFolder.open();
}