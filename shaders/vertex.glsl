#version 330 core

layout(location = 0) in vec3 position;
layout(location = 1) in vec2 uv;

flat out vec2 vUV0;
flat out vec2 vUV1;
flat out vec2 vUV2;

void main() {
    gl_Position = vec4(position, 1.0);

    // Pass the UV coordinates to the fragment shader
    // Assume you have access to the three vertex UVs for the triangle:
    // uv0, uv1, uv2 (set by your draw call or vertex attributes)
    vUV0 = uv;
    vUV1 = uv;
    vUV2 = uv;
}