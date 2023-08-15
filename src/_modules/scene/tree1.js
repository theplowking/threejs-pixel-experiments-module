
import * as THREE from 'three';

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let tree, leavesMat, matrix, dummy;

let params = {
    uColorA:  new THREE.Color(0xb45252),
    uColorB:  new THREE.Color(0xd3a068),
    uColorC:  new THREE.Color(0xede19e),
};

export function setup(scene, gui) {
    dummy = new THREE.Object3D();
    matrix = new THREE.Matrix4();
    const pointer = new THREE.Vector2(); 
    const raycaster = new THREE.Raycaster();
    const dlight01 = new THREE.DirectionalLight(0xcccccc, 1.8);
    tree = {group: new THREE.Group()};
    const noiseMap = new THREE.TextureLoader().load('https://raw.githubusercontent.com/ceramicSoda/treeshader/main/assets/noise.png');
    const poleTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/ceramicSoda/treeshader/main/assets/texture.jpg');
    poleTexture.rotation = 100 * 0.01745329252; // WTF???
    const rayPlane = new THREE.Mesh(new THREE.PlaneGeometry(100,100,1,1), undefined);
    // MATERIALS
    leavesMat = new THREE.ShaderMaterial({
    lights: true,
    side: THREE.DoubleSide,
    uniforms: {
        ...THREE.UniformsLib.lights,
        uTime: {value: 0.},
        uColorA: {value: params.uColorA},
        uColorB: {value: params.uColorB},
        uColorC: {value: params.uColorC},
        uBoxMin: {value: new THREE.Vector3(0,0,0)},
        uBoxSize: {value: new THREE.Vector3(10,10,10)},
        uRaycast: {value: new THREE.Vector3(0,0,0)},
        uNoiseMap: {value: noiseMap},
    },
    vertexShader: leavesVS,
    fragmentShader: leavesFS,
    })

    //model load
    // Instantiate a loader
    const loader = new GLTFLoader();

    loader.loadAsync("https://raw.githubusercontent.com/ceramicSoda/treeshader/main/assets/tree.glb")
    .then(obj => {
    tree.pole = obj.scene.getObjectByName("Pole");
    tree.pole.material = new THREE.MeshToonMaterial({map: tree.pole.material.map});
    // Each vertex of crown mesh will be a leaf
    // Crown mesh won't be visible in scene
    tree.crown = obj.scene.getObjectByName("Leaves");
    // For object space shader
    tree.bbox = new THREE.Box3().setFromObject(tree.crown);
    leavesMat.uniforms.uBoxMin.value.copy(tree.bbox.min); 
    leavesMat.uniforms.uBoxSize.value.copy(tree.bbox.getSize(new THREE.Vector3())); 
    tree.leavesCount = tree.crown.geometry.attributes.position.count;
    tree.whenDied = new Array(tree.leavesCount);
    tree.deadID = []; 
    tree.leafGeometry = obj.scene.getObjectByName("Leaf").geometry; 
    tree.leaves = new THREE.InstancedMesh(tree.leafGeometry, leavesMat, tree.leavesCount); 
    for (let i = 0; i < tree.leavesCount; i++) { 
        dummy.position.x = tree.crown.geometry.attributes.position.array[i*3];
        dummy.position.y = tree.crown.geometry.attributes.position.array[i*3+1];
        dummy.position.z = tree.crown.geometry.attributes.position.array[i*3+2];
        dummy.lookAt(dummy.position.x + tree.crown.geometry.attributes.normal.array[i*3],
                    dummy.position.y + tree.crown.geometry.attributes.normal.array[i*3+1],
                    dummy.position.z + tree.crown.geometry.attributes.normal.array[i*3+2]);
        dummy.scale.x = (Math.random() * 0.2 + 0.8);
        dummy.scale.y = (Math.random() * 0.2 + 0.8);
        dummy.scale.z = (Math.random() * 0.2 + 0.8);
        dummy.updateMatrix();
        tree.leaves.setMatrixAt(i, dummy.matrix);
    }
    tree.group.add(tree.pole, tree.leaves);
    for (let i = 0; i < 24; i++)
        tree.deadID.push(Math.floor(Math.random() * tree.leavesCount)); 
    })

    //init
    dlight01.position.set(3,6,-3);
    dlight01.lookAt(0,2.4,0);
    rayPlane.visible = false;

    scene.add(dlight01, tree.group, rayPlane);
    noiseMap.wrapS = THREE.RepeatWrapping;
    noiseMap.wrapT = THREE.RepeatWrapping;


    setupGUI(gui);

}

function setupGUI(gui) {
    //add gui

    const treeFolder = gui.addFolder('Tree');

    treeFolder.addColor( params, 'uColorA' ).onChange( function ( value ) {
        leavesMat.uniforms[ 'uColorA' ].value.set( value );
    } );
    treeFolder.addColor( params, 'uColorB' ).onChange( function ( value ) {
        leavesMat.uniforms[ 'uColorB' ].value.set( value );
    } );
    treeFolder.addColor( params, 'uColorC' ).onChange( function ( value ) {
        leavesMat.uniforms[ 'uColorC' ].value.set( value );
    } );

    treeFolder.close();
}


export function update(delta) {

    leavesMat.uniforms.uTime.value += delta/10; 

    if (tree.deadID){
        tree.deadID = tree.deadID.map(i => {
        tree.leaves.getMatrixAt(i, matrix);
        matrix.decompose(dummy.position, dummy.rotation, dummy.scale);
        if (dummy.position.y > 0) {
            dummy.position.y -= 0.04;
            dummy.position.x += Math.random()/5 - 0.11;
            dummy.position.z += Math.random()/5 - 0.11;
            dummy.rotation.x += 0.2;
            dummy.updateMatrix();
            tree.leaves.setMatrixAt(i, dummy.matrix);
            return(i);
        }
        })
        tree.leaves.instanceMatrix.needsUpdate = true; 
    } 

}


const leavesVS = /*glsl*/`
    uniform sampler2D uNoiseMap;
    uniform vec3 uBoxMin, uBoxSize, uRaycast;
    uniform float uTime;
    varying vec3 vObjectPos, vNormal, vWorldNormal; 
    varying float vCloseToGround;
    
    vec4 getTriplanar(sampler2D tex){
        vec4 xPixel = texture(tex, (vObjectPos.xy + uTime) / 3.);
        vec4 yPixel = texture(tex, (vObjectPos.yz + uTime) / 3.);
        vec4 zPixel = texture(tex, (vObjectPos.zx + uTime) / 3.);
        vec4 combined = (xPixel + yPixel + zPixel) / 6.0;
        combined.xyz = combined.xyz * vObjectPos; 
        return combined;
    }
    
    void main(){
        mat4 mouseDisplace = mat4(1.);
        vec3 vWorldPos = vec3(modelMatrix * instanceMatrix * mouseDisplace * vec4(position, 1.));
        vCloseToGround = clamp(vWorldPos.y, 0., 1.);
        float offset = clamp(0.8 - distance(uRaycast, instanceMatrix[3].xyz), 0., 999.); 
        offset = (pow(offset, 0.8) / 2.0) * vCloseToGround;
        mouseDisplace[3].xyz = vec3(offset);
        vNormal = normalMatrix * mat3(instanceMatrix) * mat3(mouseDisplace) * normalize(normal); 
        vWorldNormal = vec3(modelMatrix * instanceMatrix * mouseDisplace * vec4(normal, 0.));
        vObjectPos = ((vWorldPos - uBoxMin) * 2.) / uBoxSize - vec3(1.0); 
        vec4 noiseOffset = getTriplanar(uNoiseMap) * vCloseToGround; 
        vec4 newPos = instanceMatrix * mouseDisplace * vec4(position, 1.); 
        newPos.xyz = newPos.xyz + noiseOffset.xyz;
        gl_Position =  projectionMatrix * modelViewMatrix * newPos;
    }
`
const leavesFS = /*glsl*/`
    #include <common> 
    #include <lights_pars_begin>
    uniform vec3 uColorA, uColorB, uColorC;
    uniform float uTime;
    varying vec3 vObjectPos, vNormal, vWorldNormal; 
    varying float vCloseToGround;
    
    vec3 mix3 (vec3 v1, vec3 v2, vec3 v3, float fa){
        vec3 m; 
        fa > 0.7 ? m = mix(v2, v3, (fa - .5) * 2.) : m = mix(v1, v2, fa * 2.);
        return m;
    }

    float getPosColors(){
        float p = 0.;
        p = smoothstep(0.2, 0.8, distance(vec3(0.), vObjectPos));
        p = p * (-(vWorldNormal.g / 2.) + 0.5) * (- vObjectPos.y / 9. + 0.5); 
        return p;
    }
    float getDiffuse(){
        float intensity;
        for (int i = 0; i < directionalLights.length(); i++){
            intensity = dot(directionalLights[i].direction, vNormal);
            intensity = smoothstep(0.55, 1., intensity) * 0.2 
                        + pow(smoothstep(0.55, 1., intensity), 0.5);
        }
        return intensity;
    }

    void main(){
        float gradMap = (getPosColors() + getDiffuse()) * vCloseToGround / 2. ;
        vec4 c = vec4(mix3(uColorA, uColorB, uColorC, gradMap), 1.0);
        gl_FragColor = vec4(pow(c.xyz,vec3(0.454545)), c.w);
		//gl_FragColor = vec4(c.xyz, c.w);
        //odd change here for color space
    }
`