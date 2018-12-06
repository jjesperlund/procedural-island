// three.js
import * as THREE from 'three'

export class Camera extends THREE.PerspectiveCamera {
    constructor(aspectRatio) {
        super(60, aspectRatio, 0.01, 2000);

        this.position.set( 0, 300, -300 );
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