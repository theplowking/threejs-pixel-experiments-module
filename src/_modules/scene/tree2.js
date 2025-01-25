
import * as THREE from 'three';

const Tree = require('./proctree.js');

export default function tree2(scene) {

    const textureLoader = new THREE.TextureLoader();

    const treeMaterial = new THREE.MeshStandardMaterial({
      color: config.treeColor,
      roughness: 1.0,
      metalness: 0.0
    });

     const twigMaterial = new THREE.MeshStandardMaterial({
      color: config.twigColor,
      roughness: 1.0,
      metalness: 0.0,
      map: textureLoader.load('assets/twig-1.png'),
      alphaTest: 0.9
    });

    const tree = new Tree(config);

    const treeGeometry = new THREE.BufferGeometry();
    treeGeometry.addAttribute('position', createFloatAttribute(tree.verts, 3));
    treeGeometry.addAttribute('normal', normalizeAttribute(createFloatAttribute(tree.normals, 3)));
    treeGeometry.addAttribute('uv', createFloatAttribute(tree.UV, 2));
    treeGeometry.setIndex(createIntAttribute(tree.faces, 1));

    const twigGeometry = new THREE.BufferGeometry();
    twigGeometry.addAttribute('position', createFloatAttribute(tree.vertsTwig, 3));
    twigGeometry.addAttribute('normal', normalizeAttribute(createFloatAttribute(tree.normalsTwig, 3)));
    twigGeometry.addAttribute('uv', createFloatAttribute(tree.uvsTwig, 2));
    twigGeometry.setIndex(createIntAttribute(tree.facesTwig, 1));

    const treeGroup = new THREE.Group();
    treeGroup.add(new THREE.Mesh(treeGeometry, treeMaterial));
    treeGroup.add(new THREE.Mesh(twigGeometry, twigMaterial));

    scene.add( treeGroup );


}

let config = {
    // proctree
    seed: 256,
    segments: 6,
    levels: 5,
    vMultiplier: 2.36,
    twigScale: 0.39,
    initalBranchLength: 0.49,
    lengthFalloffFactor: 0.85,
    lengthFalloffPower: 0.99,
    clumpMax: 0.454,
    clumpMin: 0.404,
    branchFactor: 2.45,
    dropAmount: -0.1,
    growAmount: 0.235,
    sweepAmount: 0.01,
    maxRadius: 0.139,
    climbRate: 0.371,
    trunkKink: 0.093,
    treeSteps: 5,
    taperRate: 0.947,
    radiusFalloffRate: 0.73,
    twistRate: 3.02,
    trunkLength: 2.4,
  
    // custom
    treeColor: 0x9d7362,
    twigColor: 0xF16950
  };