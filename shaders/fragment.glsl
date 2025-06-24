#version 330 core

uniform sampler2D uTexture;

flat in vec2 vUV0;
flat in vec2 vUV1;
flat in vec2 vUV2;

out vec4 fragColor;

void main() {
    vec3 color0 = texture(uTexture, vUV0).rgb;
    vec3 color1 = texture(uTexture, vUV1).rgb;
    vec3 color2 = texture(uTexture, vUV2).rgb;
    vec3 avgColor = (color0 + color1 + color2) / 3.0;
    fragColor = vec4(avgColor, 1.0);
}