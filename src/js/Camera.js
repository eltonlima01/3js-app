import * as THREE from "three";

const RADIUS_3D = 30.0;
const RADIUS_2D = 15.0;

export class Camera {
  constructor() {
    const canvas = document.querySelector("#canvas");

    const DEFAULT_ASPECT = canvas.clientWidth / canvas.clientHeight;

    const DEFAULT_FOV = 45;
    const DEFAULT_NEAR = 0.1;
    const DEFAULT_FAR = 100.0;

    this.isCameraMode = false;
    this.isPerspectiveMode = false;

    this.previousMousePosition = { x: 0, y: 0 };

    this.angleY = Math.PI / 6;
    this.angleXZ = Math.PI / 2;

    this.camera3D = new THREE.PerspectiveCamera(
      DEFAULT_FOV,
      DEFAULT_ASPECT,
      DEFAULT_NEAR,
      DEFAULT_FAR,
    );

    this.camera3D.position.set (
      RADIUS_3D * Math.cos(this.angleXZ) * Math.cos(this.angleY),
      RADIUS_3D * Math.sin(this.angleY),
      RADIUS_3D * Math.sin(this.angleXZ) * Math.cos(this.angleY)
    );
    
    this.camera3D.lookAt(0, 0, 0);

    const DEFAULT_FRUSTUM = DEFAULT_ASPECT * RADIUS_2D;

    this.camera2D = new THREE.OrthographicCamera(
      -DEFAULT_FRUSTUM,
      DEFAULT_FRUSTUM,
      RADIUS_2D,
      -RADIUS_2D,
      DEFAULT_NEAR,
      DEFAULT_FAR,
    );

    this.camera2D.position.z = RADIUS_2D;

    this.controls();
  }

  controls() {
    window.addEventListener("contextmenu", (event) => event.preventDefault());
    window.addEventListener("mouseleave", (event) => { this.isCameraMode = false });

    window.addEventListener("mousedown", (event) => {
      if (event.button === 2) {
        this.isCameraMode = true;
        this.previousMousePosition = { x: event.clientX, y: event.clientY };
      }
    });

    window.addEventListener("mouseup", (event) => { if (event.button === 2) { this.isCameraMode = false } });

    window.addEventListener("mousemove", (event) => {
      if (!this.isCameraMode) { return }

      const deltaMove = {
        x: event.clientX - this.previousMousePosition.x,
        y: event.clientY - this.previousMousePosition.y,
      };

      if (this.isPerspectiveMode) {
        this.angleY += deltaMove.y * 0.005;
        this.angleXZ += deltaMove.x * 0.005;

        const maxPitch = (Math.PI / 2) * 0.99;
        this.angleY = Math.max(-maxPitch, Math.min(maxPitch, this.angleY));

        this.camera3D.position.x =
          RADIUS_3D * Math.cos(this.angleXZ) * Math.cos(this.angleY);
        this.camera3D.position.y = RADIUS_3D * Math.sin(this.angleY);
        this.camera3D.position.z =
          RADIUS_3D * Math.sin(this.angleXZ) * Math.cos(this.angleY);

        this.camera3D.lookAt(0, 0, 0);
      } else {
        const speed = 0.02 / this.camera2D.zoom;

        this.camera2D.position.x -= deltaMove.x * speed;
        this.camera2D.position.y += deltaMove.y * speed;
      }

      this.previousMousePosition = { x: event.clientX, y: event.clientY };
    });

    window.addEventListener("wheel", (event) => {
      if (this.isPerspectiveMode) {
        this.camera3D.fov += event.deltaY * 0.05;
        this.camera3D.fov = Math.max(10, Math.min(this.camera3D.fov, 120));

        this.camera3D.updateProjectionMatrix();
      } else {
        this.camera2D.zoom -= event.deltaY * 0.001 * this.camera2D.zoom;
        this.camera2D.zoom = Math.max(0.1, Math.min(this.camera2D.zoom, 50));

        this.camera2D.updateProjectionMatrix();
      }
    });
  }

  resize(aspect) {
    this.camera3D.aspect = aspect;
    this.camera3D.updateProjectionMatrix();

    const width = RADIUS_2D * aspect;

    this.camera2D.left = -width;
    this.camera2D.right = width;
    this.camera2D.updateProjectionMatrix();
  }

  get() {
    return this.isPerspectiveMode ? this.camera3D : this.camera2D;
  }
}
