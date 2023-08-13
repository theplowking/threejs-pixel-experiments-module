
import * as THREE from 'three';

import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { PaletteShader } from '../shaders/palette_shader.js';
// import { C64Shader } from '../shaders/c64_shader.js';
// import { DitheShader } from '../shaders/dither_shader.js';

export default function palettePass(composer, gui, enabled) {

    const paletteSource = [0xfeac5d, 0xc98c50, 0xaf936e, 0x8c8754, 0xcc551e, 0xa29663, 0x2e2a1f, 0x000000, 0x2a482d, 0x9b845c, 0xb32e22, 0x877a57, 0x7d2a1c, 0xa79d6c]

    let paletteUniform = [];
    paletteSource.forEach(function (colPal, index) {
        paletteUniform.push(new THREE.Color( colPal).convertLinearToSRGB());
        });                                           
    
    const PaletteShaderPass = new ShaderPass( PaletteShader );
    PaletteShaderPass.uniforms[ 'palette' ].value = paletteUniform;
    PaletteShaderPass.uniforms[ 'paletteSize' ].value = paletteUniform.length;
    composer.addPass( PaletteShaderPass );

    PaletteShaderPass.enabled = enabled;

    // setup GUI
    
    const paletteFolder = gui.addFolder('Palette');

    paletteUniform.forEach(function (colPal, index) {
        paletteUniform.push(new THREE.Color( colPal));
        paletteFolder.addColor(paletteUniform, index)
				.name(index)
				.onChange(function(col) {
                    PaletteShaderPass.uniforms[ 'palette' ].value = paletteUniform;
				});
    }); 

    var obj = { debug:function(){ 
        let t=[];
        paletteUniform.forEach((e) => {t.push("0x" + e.clone().convertSRGBToLinear().getHexString());}); //convertLinearToSRGB()
        console.log(t.slice(0,paletteSource.length));
     }};

    paletteFolder.add(obj,'debug');

    var obj2 = { enable:function(){ 
        PaletteShaderPass.enabled = !PaletteShaderPass.enabled;
     }};

    paletteFolder.add(obj2,'enable');

    paletteFolder.close();

}



