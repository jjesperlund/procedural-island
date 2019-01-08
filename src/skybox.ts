
import * as THREE from 'three'
import loadShader from './utils/load-shader'

export class Sky
 {

    constructor(scene) {
        
        loadShader('/src/shaders/sky.vert', (vsErr, vsText) => { 
            loadShader('/src/shaders/sky.frag', (frErr, frText) => { 

                let skyUniforms = {
                    sunPosition: {type: "v3", value: new THREE.Vector3(10, 8, 1)}
                };

                // Assign shader to material
                let m = new THREE.ShaderMaterial({
                    vertexShader : vsText,
                    fragmentShader : frText,
                    uniforms: skyUniforms
                });

                m.side = THREE.BackSide;

                let g = new THREE.SphereBufferGeometry(12.5, 70, 70, 0, 2 * Math.PI, 0, Math.PI/2);

                let mesh = new THREE.Mesh(g, m);
                scene.add(  mesh);                

            });
        });


    }

}