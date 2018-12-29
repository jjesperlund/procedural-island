
import * as THREE from 'three'

export class Sky
 {
    loadShader( path, callback ) {
        var request = new XMLHttpRequest();
        request.open('GET', path, true);
        request.onload = function () {
            if (request.status < 200 || request.status > 299) {
                callback('Error: HTTP Status ' + request.status + ' on resource ' + path);
            } else {
                callback(null, request.responseText);
            }
        };
        request.send();
    };

    constructor(scene) {
        
        this.loadShader('/src/shaders/sky.vert', (vsErr, vsText) => { 
            this.loadShader('/src/shaders/sky.frag', (frErr, frText) => { 

                // Assign shader to material
                let m = new THREE.ShaderMaterial({
                    vertexShader : vsText,
                    fragmentShader : frText,
                });

                m.side = THREE.BackSide;

                let g = new THREE.SphereBufferGeometry(12.5, 70, 70, 0, 2 * Math.PI, 0, Math.PI/2);

                let mesh = new THREE.Mesh(g, m);
                scene.add(  mesh);                

            });
        });


    }

}