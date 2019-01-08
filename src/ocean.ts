
import * as THREE from 'three'
import loadShader from './utils/load-shader'

export class Ocean extends THREE.Mesh
 {
    private mesh: THREE.Mesh;
    private LODNode: THREE.LOD = new THREE.LOD();
    private clock: THREE.Clock = new THREE.Clock();
    private scene: any;
    private renderer: any;
    private camera: any;

    /*
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
    */

    constructor(scene, renderer, camera, controls, GUIControls) {
        super();

        const numberOfLODS = 3;
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;

        loadShader('src/shaders/water.vert', (vsErr, vsText) => { 
            loadShader('src/shaders/water.frag', (frErr, frText) => { 

                let uniforms = {
                    time: { type: "f", value: 10.0 },
                    islandWobbliness: { type: "f", value: GUIControls.islandWobbliness },
                    islandRadius: { type: "f", value: 2.5 },
                    beachWidth: { type: "f", value: 0.2 }
                };

                // Assign shader to material
                let m = new THREE.ShaderMaterial({
                    uniforms : THREE.UniformsUtils.merge([
                        THREE.UniformsLib['lights'],
                        THREE.UniformsLib['ambient'],
                        uniforms
                    ]),
                    vertexShader : vsText,
                    fragmentShader : frText,
                    lights: true
                });

                m.needsUpdate = true;

                /*
                let g = new THREE.BoxBufferGeometry(25, 0.2, 25, 150, 1, 150);

                this.mesh = new THREE.Mesh(g, m);
                //this.ocean.position.y = -0.05;
                this.scene.add(this.mesh);    
                */
                for (var i = 0; i < numberOfLODS; i++) {
                    const g = new THREE.BoxBufferGeometry(25, 0.2, 25, 800 - i * 200, 1, 800 - i * 200);
                    var ocean = new THREE.Mesh(g, m);
                    this.LODNode.addLevel(ocean, i * 2 + 5);
                }
                scene.add(this.LODNode);   
                this.LODNode.update(camera);         

            });
        });

        // Update camera position and send to shaders when view changes
        controls.addEventListener( 'change', () => {
            this.LODNode.update(camera);
        });

    }

    update(amountWobbliness) {
        // Update shader uniforms
        if (this.LODNode.children.length > 0) {
            let currentLODMesh = this.LODNode.getObjectForDistance(this.camera.position.length());
            // @ts-ignore
            currentLODMesh.material.uniforms.time.value = this.clock.getElapsedTime();
            // @ts-ignore
            currentLODMesh.material.uniforms.islandWobbliness.value = amountWobbliness;
        }
    }

}