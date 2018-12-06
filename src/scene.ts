// three.js
import * as THREE from 'three'
// import source from 'raw-loader!glslify-loader!./test.frag'
// import shader from '../src/shaders/test.fs'

export class Scene extends THREE.Scene {
    private backgroundColor: THREE.Color = new THREE.Color(163/255, 210/255, 247/255);

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
        let axis = new THREE.AxesHelper(800);
        this.add(axis);

        //this.add( new THREE.GridHelper( 800, 800 ) );

        this.loadShader('/src/shaders/ground-base.vert', (vsErr, vsText) => { 
            this.loadShader('/src/shaders/ground-base.frag', (frErr, frText) => { 

                let uniforms = {
                    scale: { type: "f", value: 10.0 },
                    displacement: { type: "f", value: 70.0},
                    time: { type: "f", value: 10.0 },
                    backgroundColor: { type: "v3", value: this.backgroundColor },
                    islandRadius: { type: "f", value: 250.0 },
                    beachWidth: { type: "f", value: 20.0 }
                };
            
                // Assign shader to material
                let m = new THREE.ShaderMaterial({
                    uniforms : uniforms,
                    vertexShader : vsText,
                    fragmentShader : frText,
                });
                    
                const g = new THREE.BoxBufferGeometry(600, 1, 600, 300, 10, 300);
                // let g = new THREE.PlaneGeometry(500, 500, 200, 200);
                // const m = new THREE.MeshLambertMaterial({ color: new THREE.Color(1.0, 0.5, 0.5) });
                let groundBaseMesh = new THREE.Mesh(g, m);
                this.add(groundBaseMesh);
            });
            
        });
        
        /*
        const g = new THREE.BoxGeometry(500, 5, 500);
        const m = new THREE.MeshLambertMaterial({ color: new THREE.Color(1.0, 0.5, 0.5) });
        let plane = new THREE.Mesh(g, m);
        this.add(plane);
        */

        // add lights
        let light = new THREE.DirectionalLight(0xffffff, 1.0)
        light.position.set(100, 400, 100)
        this.add(light)

        var ambient = new THREE.HemisphereLight( 0xbbbbff, 0x886666, 0.75 );
        ambient.position.set( -0.5, 0.75, -1 );
        this.add( ambient );

        this.background = new THREE.Color( this.backgroundColor);
    }
}