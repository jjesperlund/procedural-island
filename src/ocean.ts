
import * as THREE from 'three'

export class Ocean extends THREE.Mesh
 {
    private mesh: THREE.Mesh;
    private clock: THREE.Clock = new THREE.Clock();
    private scene: any;
    private renderer: any;
    private camera: any;

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

    constructor(scene, renderer, camera, light) {
        super();

        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;

        this.loadShader('/src/shaders/water.vert', (vsErr, vsText) => { 
            this.loadShader('/src/shaders/water.frag', (frErr, frText) => { 

                // Assign shader to material
                let m = new THREE.ShaderMaterial({
                    uniforms: {
                        time: { type: "f", value: 10.0 },
                        islandRadius: { type: "f", value: 2.5 },
                        beachWidth: { type: "f", value: 0.2 }
                    },
                    vertexShader : vsText,
                    fragmentShader : frText,
                });

                m.needsUpdate = true;

                let g = new THREE.BoxBufferGeometry(25, 0.2, 25, 150, 1, 150);

                this.mesh = new THREE.Mesh(g, m);
                //this.ocean.position.y = -0.05;
                this.scene.add(this.mesh);                

            });
        });

    }

    update() {
        if (this.mesh) {
            // @ts-ignore
            this.mesh.material.uniforms.time.value = this.clock.getElapsedTime();
        }
    }

}