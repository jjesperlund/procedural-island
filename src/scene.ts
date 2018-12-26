// three.js
import * as THREE from 'three'

export class Scene extends THREE.Scene {
    private controls: any;
    private backgroundColor: THREE.Color = new THREE.Color(163/255, 210/255, 247/255);
    private light: THREE.PointLight;
    private cameraPosition: THREE.Vector3;
    private islandMesh: THREE.Mesh;
    private waterMesh: THREE.Mesh;
    private LODNode: THREE.LOD = new THREE.LOD();
    private clock: THREE.Clock = new THREE.Clock();
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
    constructor(camera, controls) {
        super();

        const numberOfLODS = 5;
        this.cameraPosition = camera.position;
        this.controls = controls;

        // add axis to the scene
        let axis = new THREE.AxesHelper(15);
        this.add(axis);

        // add lights
        this.light = new THREE.PointLight(0xffffff, 8.0, 0, 2);
        this.light.position.set(5, 5, 1);
        /*
        light.castShadow = true; 
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.camera.left = -1000;
        light.shadow.camera.right = 1000;
        light.shadow.camera.top = 1000;
        light.shadow.camera.bottom = -1000;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 1000;
        */
        this.add(this.light);

        var helper = new THREE.PointLightHelper( this.light, 1 );
        this.add( helper );
        

       //var light = new THREE.SpotLight( 0xffffff, 0.1, 1000, 0.2 );
       //light.position.set(800, 50, 100);
       //this.add( light );
       
       //var spotLightHelper = new THREE.SpotLightHelper( light );
       //this.add( spotLightHelper );

        var ambient = new THREE.HemisphereLight( 0xbbbbff, 0x886666, 0.95 );
        ambient.position.set( -0.5, 0.75, -1 );
        //this.add( ambient );

        this.background = new THREE.Color( this.backgroundColor);

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

                let g = new THREE.BoxBufferGeometry(10, 0.2, 10, 100, 1, 100);

                this.waterMesh = new THREE.Mesh(g, m);
                //this.waterMesh.position.y = -0.05;
                this.add(this.waterMesh);                

            });
        });


        this.loadShader('/src/shaders/ground-base.vert', (vsErr, vsText) => { 
            this.loadShader('/src/shaders/ground-base.frag', (frErr, frText) => { 

                let uniforms = {
                    scale: { type: "f", value: 0.1 },
                    displacement: { type: "f", value: 1.0},
                    time: { type: "f", value: 10.0 },
                    backgroundColor: { type: "v3", value: this.backgroundColor },
                    islandRadius: { type: "f", value: 2.5 },
                    beachWidth: { type: "f", value: 0.2 },
                    lightPos: { type: "v3", value: this.light.position },
                    cameraPos: { type: "v3", value: this.cameraPosition }
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
                    var islandMesh = new THREE.Mesh(g, m);
                    this.LODNode.addLevel(islandMesh, i * 2 + 3);
                }
                this.add(this.LODNode);
                /*
                const g = new THREE.BoxBufferGeometry(6, 0.05, 6, 200, 1, 200);
                // let g = new THREE.PlaneGeometry(500, 500, 200, 200);
                // const m = new THREE.MeshLambertMaterial({ color: new THREE.Color(1.0, 0.5, 0.5) });
                this.islandMesh = new THREE.Mesh(g, m);
                this.add(this.islandMesh);
                */
            });
            
        });
  
        // Update camera position and send to shaders when view changes
        this.controls.addEventListener( 'change', () => {
            this.LODNode.update(camera);
            /*
            if (this.islandMesh.material) {
                // @ts-ignore
                this.islandMesh.material.uniforms.cameraPos.value = this.cameraPosition;
            }
            */
        });
        

    }

    update() {
        //this.light.rotateY(Math.PI / 100);
        if (this.waterMesh) {
            // @ts-ignore
            this.waterMesh.material.uniforms.time.value = this.clock.getElapsedTime();
        }
    }
}