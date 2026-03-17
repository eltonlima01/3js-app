import * as THREE from "three";

const STICK_COLOR = 0xeeee00;

const STICK_HALF_WIDTH = 0.0965;
const STICK_HALF_HEIGHT = 0.3915;
const STICK_HALF_DEPTH = 6.0015;

////////////////////////////////////////////////////////////////

export class Stick
{
    constructor (canvas, camera)
    {
        const geometry = new THREE.BoxGeometry (STICK_HALF_WIDTH, STICK_HALF_HEIGHT, STICK_HALF_DEPTH);
        const material = new THREE.MeshPhongMaterial ({color: STICK_COLOR});
        
        this.mesh = new THREE.Mesh (geometry, material);
        this.mesh.rotation.y = Math.PI / 2;

        this.canvas = canvas;
        this.camera = camera;

        this.mouse = new THREE.Vector2 ();
        this.offset = new THREE.Vector3 ();
        this.dragPlane = new THREE.Plane ();
        this.rayCaster = new THREE.Raycaster ();
        this.planeNormal = new THREE.Vector3 (0, 0, 0);

        this.isSelected = false;

        this.controls ();
    }

    get () {
        return this.mesh;
    }

    updateMousePos (event)
    {
        const rect = this.canvas.getBoundingClientRect ();

        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    controls ()
    {
        window.addEventListener ("pointerdown", (event) =>
        {
            if ((event.button !== 0) || (this.camera.isPerspectiveMode === true)) {
                return;
            }
    
            this.updateMousePos (event);
    
            this.rayCaster.setFromCamera (this.mouse, this.camera.get ());
    
            const intersects = this.rayCaster.intersectObject (this.mesh);
    
            if (intersects.length > 0)
            {
                this.isSelected = true;
    
                this.dragPlane.setFromNormalAndCoplanarPoint (this.camera.get ().getWorldDirection (this.planeNormal), this.mesh.position);
    
                this.rayCaster.ray.intersectPlane (this.dragPlane, this.offset);
                this.offset.sub (this.mesh.position);
    
                this.mesh.material.color.setHex (0xffaa00);
            }
        });
    
        window.addEventListener ("pointermove", (event) =>
        {
            if (this.isSelected === false) {
                return;
            }
    
            this.updateMousePos (event);
            this.rayCaster.setFromCamera (this.mouse, this.camera.get ());
    
            const intersectPoint = new THREE.Vector3 ();
            this.rayCaster.ray.intersectPlane (this.dragPlane, intersectPoint);
    
            this.mesh.position.copy (intersectPoint.sub (this.offset));
        });
    
        window.addEventListener ("pointerup", (event) =>
        {
            if ((event.button === 0) && (this.isSelected === true)) {
                this.isSelected = false;

                this.mesh.material.color.setHex (0xeeee00);
            }
        });
    }
}