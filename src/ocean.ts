
import * as THREE from 'three'
import loadShader from './utils/load-shader'

export class Ocean extends THREE.Mesh
 {
    private LODNode: THREE.LOD = new THREE.LOD();
    private clock: THREE.Clock = new THREE.Clock();
    private camera: any;

    constructor(scene, renderer, camera, controls, GUIControls) {
        super();

        const numberOfLODS = 3;
        this.camera = camera;

        loadShader('src/shaders/water.vert', (vsErr, vsText) => { 
            loadShader('src/shaders/water.frag', (frErr, frText) => { 

                // Shader uniforms passed into the ocean's shaders
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

                // Add LOD meshes
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
        // Update shader uniforms each frame
        if (this.LODNode.children.length > 0) {
            let currentLODMesh = this.LODNode.getObjectForDistance(this.camera.position.length());
            // @ts-ignore
            currentLODMesh.material.uniforms.time.value = this.clock.getElapsedTime();
            // @ts-ignore
            currentLODMesh.material.uniforms.islandWobbliness.value = amountWobbliness;
        }
    }

}