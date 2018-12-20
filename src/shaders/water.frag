
varying float noise;

void main() {
  gl_FragColor = vec4(0.0,  // R
                      0.0,  // G
                      0.9 * noise + 0.3,  // B
                      1.0); // A
}