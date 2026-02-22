
import * as THREE from 'three';

import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { PaletteShader } from '../shaders/palette_shader.js';

function linearToSRGB(c) {
    return c < 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1.0 / 2.4) - 0.055;
}
function sRGBToLinear(c) {
    return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
}
function colorLinearToSRGB(color) {
    color.r = linearToSRGB(color.r);
    color.g = linearToSRGB(color.g);
    color.b = linearToSRGB(color.b);
    return color;
}
function colorSRGBToLinear(color) {
    color.r = sRGBToLinear(color.r);
    color.g = sRGBToLinear(color.g);
    color.b = sRGBToLinear(color.b);
    return color;
}
// import { C64Shader } from '../shaders/c64_shader.js';
// import { DitheShader } from '../shaders/dither_shader.js';

export default function palettePass(composer, gui, enabled) {

    const paletteSource = [ 0x7f4729, 0xb5794d,  0x33150c,  0x244f65, 0x061122,0x000000,0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x000000]

    // pool
    
    //fire at the ruins
    //[0x9e9a9c, 0x443d3a, 0xffffff, 0x42652e, 0x67943d, 0x1c2e14, 0xa32e2a, 0xff7416, 0x030303, 0x735fba, 0xffffe0, 0x50120b, 0x675b55, 0x000000];


    //[0xfeac5d, 0xc98c50, 0xaf936e, 0x8c8754, 0xcc551e, 0xa29663, 0x2e2a1f, 0x000000, 0x2a482d, 0x9b845c, 0xb32e22, 0x877a57, 0x7d2a1c, 0xa79d6c]

    let paletteUniform = [];
    paletteSource.forEach(function (colPal, index) {
        paletteUniform.push(colorLinearToSRGB(new THREE.Color( colPal)));
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
        paletteUniform.forEach((e) => {t.push("0x" + colorSRGBToLinear(e.clone()).getHexString());}); //convertLinearToSRGB()
        console.log(t.slice(0,paletteSource.length));
     }};

    paletteFolder.add(obj,'debug');

    var obj2 = { enable:function(){ 
        PaletteShaderPass.enabled = !PaletteShaderPass.enabled;
     }};

    paletteFolder.add(obj2,'enable');

    paletteFolder.close();

}



