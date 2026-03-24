import * as THREE from "three";

const STICK_COLOR = 0xffff00;
const GAP = 1.0;

const STICK_HALF_WIDTH = 0.0965;
const STICK_HALF_HEIGHT = 0.3915;
const STICK_HALF_DEPTH = 6.0015;

// ################################################################ //

export class Stick
{
    constructor (canvas, camera)
    {
        this.group = new THREE.Group ();

        // ################################ //

        const geometry = new THREE.BoxGeometry (STICK_HALF_WIDTH, STICK_HALF_HEIGHT, STICK_HALF_DEPTH);
        this.material = new THREE.MeshPhongMaterial ({color: STICK_COLOR});
        
        this.meshFront = new THREE.Mesh (geometry, this.material);
        this.meshFront.rotation.y = Math.PI / 2;
        this.meshFront.position.z = -GAP;

        this.meshBack = new THREE.Mesh (geometry, this.material);
        this.meshBack.rotation.y = Math.PI / 2;
        this.meshBack.position.z = GAP;

        // ################################ //

        this.group.add (this.meshFront);
        this.group.add (this.meshBack);

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
        return this.group;
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
    
            const intersects = this.rayCaster.intersectObject (this.group, true);
    
            if (intersects.length > 0)
            {
                this.isSelected = true;
    
                this.dragPlane.setFromNormalAndCoplanarPoint (this.camera.get ().getWorldDirection (this.planeNormal), this.group.position);
    
                this.rayCaster.ray.intersectPlane (this.dragPlane, this.offset);
                this.offset.sub (this.group.position);
    
                this.material.color.setHex (0xffaa00);
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
    
            this.group.position.copy (intersectPoint.sub (this.offset));
        });
    
        window.addEventListener ("pointerup", (event) =>
        {
            if ((event.button === 0) && (this.isSelected === true)) {
                this.isSelected = false;

                this.material.color.setHex (0xeeee00);
            }
        });
    }
}