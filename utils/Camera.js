import * as THREE from "three";

const DEFAULT_FOV = 45;
const DEFAULT_NEAR = 0.1;
const DEFAULT_FAR = 100;
const DEFAULT_RADIUS = 10;

////////////////////////////////////////////////////////////////

export class Camera
{
    constructor (canvas)
    {
        this.isCameraMode = false;

        this.previousMousePosition = {x: 0, y: 0};

        this.angleY = 0;
        this.angleXZ = Math.PI / 2;

        const aspect = canvas.clientWidth / canvas.clientHeight;

        this.camera = new THREE.PerspectiveCamera (DEFAULT_FOV, aspect, DEFAULT_NEAR, DEFAULT_FAR);
        this.camera.position.z = DEFAULT_RADIUS;

        this.controls ();
    }

    ////////////////////////////////

    controls ()
    {
        window.addEventListener ("contextmenu", (event) => event.preventDefault ());
        window.addEventListener ("mouseleave", (event) => {this.isCameraMode = false;});

        window.addEventListener ("mousedown", (event) =>
        {
            if (event.button === 2) {
                this.isCameraMode = true;

                this.previousMousePosition = {x: event.clientX, y: event.clientY};
            }
        });

        window.addEventListener ("mouseup", (event) => {
            if (event.button === 2) {
                this.isCameraMode = false;
            }
        });

        window.addEventListener ("mousemove", (event) =>
        {
            if (this.isCameraMode)
            {
                const deltaMove = {
                    x: event.clientX - this.previousMousePosition.x,
                    y: event.clientY - this.previousMousePosition.y
                };

                this.angleY += deltaMove.y * 0.005;
                this.angleXZ += deltaMove.x * 0.005;

                const maxPitch = (Math.PI / 2) * 0.99;
                this.angleY = Math.max (-maxPitch, Math.min (maxPitch, this.angleY));

                this.camera.position.x = DEFAULT_RADIUS * Math.cos (this.angleXZ) * Math.cos (this.angleY);
                this.camera.position.y = DEFAULT_RADIUS * Math.sin (this.angleY);
                this.camera.position.z = DEFAULT_RADIUS * Math.sin (this.angleXZ) * Math.cos (this.angleY);

                this.camera.lookAt (0, 0, 0);

                this.previousMousePosition = {x: event.clientX, y: event.clientY};
            }
        })

        window.addEventListener ("wheel", (event) =>
        {
            this.camera.fov += event.deltaY * 0.05;
            this.camera.fov = Math.max (10, Math.min (this.camera.fov, 120));
            
            this.camera.updateProjectionMatrix ();
        });
    }

    ////////////////////////////////

    resize (newAspect) {
        this.camera.aspect = newAspect;
        this.camera.updateProjectionMatrix ();
    }

    ////////////////////////////////

    get () {
        return this.camera;
    }
}