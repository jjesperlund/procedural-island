// three.js
import * as THREE from 'three'

export class Camera extends THREE.PerspectiveCamera {
    constructor(aspectRatio) {
        super(60, aspectRatio, 0.01, 30);

        this.position.set( 0, 5, -5 );
        //this.lookAt( 0, -100, 0 );
    }

    update() {
        /*
        var time = performance.now() / 5000;

        this.position.x = Math.sin( time ) * 5;
        this.position.z = Math.cos( time ) * 5;
        this.lookAt( 0, -200, 0 );
        */
    }
}