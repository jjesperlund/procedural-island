// three.js
import * as THREE from 'three'
import { Island } from './island';
import { Ocean } from './ocean';
import { Sky } from './skybox'; 

export class Scene extends THREE.Scene {
    private controls: any;
    private backgroundColor: THREE.Color = new THREE.Color(163/255, 210/255, 247/255);
    private light: THREE.PointLight;
    private ocean: Ocean;

    constructor(camera, renderer, controls) {
        super();

        this.controls = controls;

        // add axis to the scene
        //let axis = new THREE.AxesHelper(15);
        //this.add(axis);

        // add lights
        this.light = new THREE.PointLight(0xffffff, 20, 0, 2);
        this.light.position.set(10, 8, 1);

        // add sun with emissive color
        let sun_geometry = new THREE.SphereBufferGeometry(0.7, 30, 30);
        let sun_material = new THREE.MeshLambertMaterial({ 
            emissive: new THREE.Color(1, 0.95, 0.7),
            emissiveIntensity: 1,
            opacity: 0.9, 
            transparent: true 
        });
        let sun = new THREE.Mesh(sun_geometry, sun_material);
        sun.position.set(10, 8, 1);
        this.add(sun);
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

        //var helper = new THREE.PointLightHelper( this.light, 1 );
        //this.add( helper );
        
       //var light = new THREE.SpotLight( 0xffffff, 0.1, 1000, 0.2 );
       //light.position.set(800, 50, 100);
       //this.add( light );
       
       //var spotLightHelper = new THREE.SpotLightHelper( light );
       //this.add( spotLightHelper );

        var ambient = new THREE.HemisphereLight( 0xbbbbff, 0x886666, 0.95 );
        ambient.position.set( -0.5, 0.75, -1 );
        //this.add( ambient );

        this.background = new THREE.Color(this.backgroundColor);

        this.ocean = new Ocean(this, renderer, camera, this.light, this.controls);

        new Sky(this);

        new Island(
            this,
            camera, 
            this.light,
            this.background,
            this.controls
        );
        
    }

    update() {
        this.ocean.update();
    }
}