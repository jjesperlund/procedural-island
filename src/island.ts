
import * as THREE from 'three'
import loadShader from './utils/load-shader'

export class Island
 {
    private LODNode: THREE.LOD = new THREE.LOD();
    private camera: any;

    constructor(scene, camera, light, backgroundColor, controls, GUIControls) {
        const numberOfLODS = 3;

        this.camera = camera;

        loadShader('src/shaders/island.vert', (vsErr, vsText) => { 
            loadShader('src/shaders/island.frag', (frErr, frText) => { 

                let uniforms = {
                    islandWobbliness: { type: "f", value: GUIControls.islandWobbliness },
                    amountMountain: { type: "f", value: GUIControls.amountMountain },
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
                    var island = new THREE.Mesh(g, m);
                    this.LODNode.addLevel(island, i * 2 + 3);
                }
                scene.add(this.LODNode);
                this.LODNode.update(camera);
            });
            
        });

        // When view changes, send new camera position to shaders
        controls.addEventListener( 'change', () => {
            this.LODNode.update(camera);
            let currentLODMesh = this.LODNode.getObjectForDistance(camera.position.length());

            // @ts-ignore
            if (currentLODMesh.material) {   
                // @ts-ignore  
                currentLODMesh.material.uniforms.cameraPos.value = camera.position;
            }
        });

    }

    update(amountWobbliness, amountMountain) {
        if (this.LODNode.children.length > 0) {
            let currentLODMesh = this.LODNode.getObjectForDistance(this.camera.position.length());
            // @ts-ignore  
            currentLODMesh.material.uniforms.islandWobbliness.value = amountWobbliness;
            // @ts-ignore  
            currentLODMesh.material.uniforms.amountMountain.value = amountMountain;
        }
    }

}