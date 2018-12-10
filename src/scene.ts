// three.js
import * as THREE from 'three'
import { Light } from 'three';
// import source from 'raw-loader!glslify-loader!./test.frag'
// import shader from '../src/shaders/test.fs'

export class Scene extends THREE.Scene {
    private backgroundColor: THREE.Color = new THREE.Color(163/255, 210/255, 247/255);
    private light: THREE.PointLight;
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
    constructor() {
        super();
        // add axis to the scene
        let axis = new THREE.AxesHelper(15);
        this.add(axis);

        this.loadShader('/src/shaders/ground-base.vert', (vsErr, vsText) => { 
            this.loadShader('/src/shaders/ground-base.frag', (frErr, frText) => { 

                let uniforms = {
                    scale: { type: "f", value: 0.1 },
                    displacement: { type: "f", value: 1.0},
                    time: { type: "f", value: 10.0 },
                    backgroundColor: { type: "v3", value: this.backgroundColor },
                    islandRadius: { type: "f", value: 2.5 },
                    beachWidth: { type: "f", value: 0.2 },
                    lightPos: { type: "v3", value: this.light.position }
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
                    
                const g = new THREE.BoxBufferGeometry(6, 0.05, 6, 200, 1, 200);
                // let g = new THREE.PlaneGeometry(500, 500, 200, 200);
                // const m = new THREE.MeshLambertMaterial({ color: new THREE.Color(1.0, 0.5, 0.5) });
                let islandMesh = new THREE.Mesh(g, m);
                islandMesh.castShadow = true;
                islandMesh.receiveShadow = true;
                this.add(islandMesh);
            });
            
        });
        
        /*
        const g = new THREE.BoxGeometry(500, 5, 500);
        const m = new THREE.MeshLambertMaterial({ color: new THREE.Color(1.0, 0.5, 0.5) });
        let plane = new THREE.Mesh(g, m);
        this.add(plane);
        */

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
    }

    update() {
        //this.light.rotateY(Math.PI / 100);
    }
}