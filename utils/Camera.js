import * as THREE from "three";

const DEFAULT_FOV = 90;
const DEFAULT_NEAR = 0.1;
const DEFAULT_FAR = 100;
const DEFAULT_RADIUS = 10;

////////////////////////////////////////////////////////////////

export class Camera
{
    constructor (canvas)
    {
        this.isCameraMode = false;
        this.isPerspectiveMode = false;

        this.previousMousePosition = {x: 0, y: 0};
    
        this.viewHeight = 20;

        this.angleY = Math.PI / 6;
        this.angleXZ = Math.PI / 2;

        const aspect = canvas.clientWidth / canvas.clientHeight;

        ////////////////////////////////

        this.camera3D = new THREE.PerspectiveCamera
        (
            DEFAULT_FOV,
            aspect,
            DEFAULT_NEAR,
            DEFAULT_FAR
        );

        this.camera3D.position.x = DEFAULT_RADIUS * Math.cos (this.angleXZ) * Math.cos (this.angleY);
        this.camera3D.position.y = DEFAULT_RADIUS * Math.sin (this.angleY);
        this.camera3D.position.z = DEFAULT_RADIUS * Math.sin (this.angleXZ) * Math.cos (this.angleY);

        this.camera3D.lookAt (0, 0, 0);

        this.camera2D = new THREE.OrthographicCamera
        (
            -this.viewHeight * aspect / 2,
            this.viewHeight * aspect / 2,
            this.viewHeight,
            -this.viewHeight,
            0.1,
            100
        );

        this.camera2D.position.z = DEFAULT_RADIUS / 2;

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
            if (this.isCameraMode === false) {
                return;
            }

            const deltaMove = {
                x: event.clientX - this.previousMousePosition.x,
                y: event.clientY - this.previousMousePosition.y
            };

            if (this.isPerspectiveMode === true)
            {
                this.angleY += deltaMove.y * 0.005;
                this.angleXZ += deltaMove.x * 0.005;

                const maxPitch = (Math.PI / 2) * 0.99;
                this.angleY = Math.max (-maxPitch, Math.min (maxPitch, this.angleY));

                this.camera3D.position.x = DEFAULT_RADIUS * Math.cos (this.angleXZ) * Math.cos (this.angleY);
                this.camera3D.position.y = DEFAULT_RADIUS * Math.sin (this.angleY);
                this.camera3D.position.z = DEFAULT_RADIUS * Math.sin (this.angleXZ) * Math.cos (this.angleY);

                this.camera3D.lookAt (0, 0, 0);
            }
            else
            {
                const speed = 0.02 / this.camera2D.zoom;

                this.camera2D.position.x -= deltaMove.x * speed;
                this.camera2D.position.y += deltaMove.y * speed;
            }

            this.previousMousePosition = {x: event.clientX, y: event.clientY};
        });

        window.addEventListener ("wheel", (event) =>
        {
            if (this.isPerspectiveMode === true)
            {
                this.camera3D.fov += event.deltaY * 0.05;
                this.camera3D.fov = Math.max (10, Math.min (this.camera3D.fov, 120));

                this.camera3D.updateProjectionMatrix ();
            }
            else
            {
                this.camera2D.zoom -= event.deltaY * 0.001 * this.camera2D.zoom;
                this.camera2D.zoom = Math.max (0.1, Math.min (this.camera2D.zoom, 50));

                this.camera2D.updateProjectionMatrix ();
            }
            
        });
    }

    ////////////////////////////////

    resize (canvas) {
        const aspect = canvas.clientWidth / canvas.clientHeight;

        this.camera3D.aspect = aspect;
        this.camera3D.updateProjectionMatrix ();

        this.camera2D.left = -this.viewHeight * aspect / 2;
        this.camera2D.right = this.viewHeight * aspect / 2;
        this.camera2D.top = this.viewHeight;
        this.camera2D.bottom = -this.viewHeight;

        this.camera2D.updateProjectionMatrix ();
    }

    ////////////////////////////////

    get () {
        return this.isPerspectiveMode ? this.camera3D : this.camera2D;
    }
}