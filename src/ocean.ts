
import * as THREE from 'three'

export class Ocean extends THREE.Mesh
 {
    private mesh: THREE.Mesh;
    private LODNode: THREE.LOD = new THREE.LOD();
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

    constructor(scene, renderer, camera, light, controls) {
        super();

        const numberOfLODS = 3;
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;

        this.loadShader('/src/shaders/water.vert', (vsErr, vsText) => { 
            this.loadShader('/src/shaders/water.frag', (frErr, frText) => { 

                let uniforms = {
                    time: { type: "f", value: 10.0 },
                    islandRadius: { type: "f", value: 2.5 },
                    beachWidth: { type: "f", value: 0.2 },
                    lightPos: { type: "v3", value: light.position },
                    cameraPos: { type: "v3", value: camera.position }
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
                    const g = new THREE.BoxBufferGeometry(25, 0.2, 25, 700 - i * 200, 1, 700 - i * 200);
                    var ocean = new THREE.Mesh(g, m);
                    this.LODNode.addLevel(ocean, i * 2 + 3);
                }
                scene.add(this.LODNode);            

            });
        });

        // Update camera position and send to shaders when view changes
        controls.addEventListener( 'change', () => {
            this.LODNode.update(camera);
            /*
            if (this.island.material) {
                // @ts-ignore
                this.island.material.uniforms.cameraPos.value = this.cameraPosition;
            }
            */
        });

    }

    update() {
        if (this.LODNode.children.length > 0) {
            let currentMesh = this.LODNode.getObjectForDistance(this.camera.position.length());
            // @ts-ignore
            currentMesh.material.uniforms.time.value = this.clock.getElapsedTime();
        }
        /*
        if (currentMesh) {
            // @ts-ignore
            currentMesh.material.uniforms.time.value = this.clock.getElapsedTime();
        }
        */
    }

}