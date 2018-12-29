// three.js
import * as THREE from 'three';
import * as OrbitControls from 'orbit-controls-es6';

// local imports
import { Renderer } from './renderer';
import { Camera } from './camera';
import { Scene } from './scene';

export class Main {
    private scene: Scene;
    private camera: Camera;
    private renderer: Renderer;
    private container: any;
    private stats: any;
    private controls: any;
    constructor(container) {

        // @ts-ignore: Unreachable code error
        this.stats = new Stats();
        document.body.appendChild( this.stats.dom );

        // // the HTML container
        this.container = container;

        // create the renderer
        this.renderer = new Renderer(this.container);

        // create the camera
        const aspectRatio = this.renderer.domElement.width / this.renderer.domElement.height;
        this.camera = new Camera(aspectRatio);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enabled = true;
        this.controls.maxDistance = 13;
        this.controls.minDistance = 3;
        this.controls.maxPolarAngle = Math.PI/2.15;

        // create the scene
        this.scene = new Scene(this.camera, this.renderer, this.controls);

        // Initial size update set to canvas container
        this.updateSize();

        // Listeners
        document.addEventListener('DOMContentLoaded', () => this.updateSize(), false);
        window.addEventListener('resize', () => this.updateSize(), false);
        
        this.render()

    
    }

    updateSize() {
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.camera.updateProjectionMatrix();
    }

    render(): void {
        this.stats.update();
        //this.camera.update();
        this.scene.update();
        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.render.bind(this)); // Bind the main class instead of window object
    }
}