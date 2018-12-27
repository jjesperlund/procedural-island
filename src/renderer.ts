
import * as THREE from 'three'

export class Renderer extends THREE.WebGLRenderer
 {
    constructor(container) {
        super({antialias: false});

        // set size
        this.setSize(window.innerWidth, window.innerHeight)
        
        // add canvas to dom
        container.appendChild(this.domElement)
        console.log("created renderer");
    }

    render(scene, camera) {
        this.render(scene, camera)
    }

}