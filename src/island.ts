
import * as THREE from 'three'

export class Island
 {
    private LODNode: THREE.LOD = new THREE.LOD();

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

    constructor(scene, camera, light, backgroundColor, controls) {
        const numberOfLODS = 3;

        this.loadShader('/src/shaders/ground-base.vert', (vsErr, vsText) => { 
            this.loadShader('/src/shaders/ground-base.frag', (frErr, frText) => { 

                let uniforms = {
                    scale: { type: "f", value: 0.1 },
                    displacement: { type: "f", value: 1.0},
                    time: { type: "f", value: 10.0 },
                    backgroundColor: { type: "v3", value: backgroundColor },
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
                    lights: true,
                });

                m.needsUpdate = true;
                    
                for (var i = 0; i < numberOfLODS; i++) {
                    const g = new THREE.BoxBufferGeometry(6, 0.05, 6, 300 - i * 55, 1, 300 - i * 55);
                    // let g = new THREE.PlaneGeometry(500, 500, 200, 200);
                    // const m = new THREE.MeshLambertMaterial({ color: new THREE.Color(1.0, 0.5, 0.5) });
                    var island = new THREE.Mesh(g, m);
                    this.LODNode.addLevel(island, i * 2 + 3);
                }
                scene.add(this.LODNode);
                /*
                const g = new THREE.BoxBufferGeometry(6, 0.05, 6, 200, 1, 200);
                // let g = new THREE.PlaneGeometry(500, 500, 200, 200);
                // const m = new THREE.MeshLambertMaterial({ color: new THREE.Color(1.0, 0.5, 0.5) });
                this.island = new THREE.Mesh(g, m);
                this.add(this.island);
                */
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

}