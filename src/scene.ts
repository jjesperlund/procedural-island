// three.js
import * as THREE from 'three'
import { Island } from './island';
import { Ocean } from './ocean';
import { Sky } from './skybox'; 

export class Scene extends THREE.Scene {
    private controls: any;
    private GUIControls: any;
    private GUI: any;
    private backgroundColor: THREE.Color = new THREE.Color(163/255, 210/255, 247/255);
    private light: THREE.PointLight;
    private ocean: Ocean;
    private island: Island;

    constructor(camera, renderer, controls) {
        super();

        this.controls = controls;

        this.initGUI();

        // add axis to the scene
        //let axis = new THREE.AxesHelper(15);
        //this.add(axis);

        // add lights
        this.light = new THREE.PointLight(0xffffff, 20, 0, 2);
        this.light.position.set(10, 8, 1);
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

        this.ocean = new Ocean(
            this, 
            renderer, 
            camera, 
            this.controls,
            this.GUIControls
        );

        new Sky(this);

        this.island = new Island(
            this,
            camera, 
            this.light,
            this.background,
            this.controls,
            this.GUIControls,
        );
        
    }

    initGUI() {
        this.GUIControls = new function(){
            this.islandWobbliness = 0.9;
            this.amountMountain = 0.6;
        }

        // @ts-ignore
        this.GUI = new dat.GUI();
        this.GUI.domElement.id = 'gui';
        this.GUI.width = 300;

        this.GUI.add(this.GUIControls, "islandWobbliness", 0.0, 1.0).name("Island Wobbliness");
        this.GUI.add(this.GUIControls, "amountMountain", 0.0, 1.0).name('Amount Mountain');
    }

    update() {
        this.ocean.update(this.GUIControls.islandWobbliness);
        this.island.update(this.GUIControls.islandWobbliness, this.GUIControls.amountMountain);
    }
}