// three.js
import * as THREE from 'three'

export class Camera extends THREE.PerspectiveCamera {
    constructor(aspectRatio) {
        super(60, aspectRatio, 0.01, 30);
        this.position.set( -13, 4, 0 );
    }
}