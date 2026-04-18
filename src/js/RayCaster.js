import * as THREE from "three";
import { Stick } from "./Stick"

export class RayCaster {
  constructor(canvas, camera, sticks) {
    this.canvas = canvas;
    this.camera = camera;
    this.sticks = sticks;

    this.raycaster = new THREE.Raycaster();
    this.dragPlane = new THREE.Plane();
    this.mouse = new THREE.Vector2();
    this.offset = new THREE.Vector3();
    this.planeNormal = new THREE.Vector3(0, 0, 0);

    this.events();
  }

  updateMousePos(event) {
    const rect = this.canvas.getBoundingClientRect();

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2.0 - 1.0;
    this.mouse.y = -(((event.clientY - rect.top) / rect.height) * 2.0) + 1.0;
  }

  events() {
    window.addEventListener("pointerup", (event) => this.onPointerUp(event));
    window.addEventListener("pointerdown", (event) =>
      this.onPointerDown(event),
    );
    window.addEventListener("pointermove", (event) =>
      this.onPointerMove(event),
    );
  }

  onPointerDown(event) {
    if (this.camera.isPerspectiveMode === true) { return }

    this.updateMousePos(event);

    this.raycaster.setFromCamera(this.mouse, this.camera.get());

    const stickGroups = this.sticks.map((stick) => stick.get());
    const intersects = this.raycaster.intersectObjects(stickGroups, true);

    if (intersects.length > 0.0) {
      const hitStick = intersects[0].object.parent.userData.instance;

      if (event.button === 2) {
        event.stopPropagation();

        window.dispatchEvent(
          new CustomEvent("openContextMenu", {
            detail: {
              stick: hitStick,
              x: event.clientX,
              y: event.clientY,
            },
          }),
        );

        return;
      }

      if (event.button === 0) {
        Stick.selectedStick = hitStick;

        for(const stick of Stick.selectedStick.cluster) {
          Stick.selectedStick.select();
        }


        this.dragPlane.setFromNormalAndCoplanarPoint(
          this.camera.get().getWorldDirection(this.planeNormal),
          Stick.selectedStick.get().position,
        );

        this.raycaster.ray.intersectPlane(this.dragPlane, this.offset);
        this.offset.sub(Stick.selectedStick.get().position);
      }
    }
  }

  onPointerMove(event) {
    if (Stick.selectedStick === null || this.camera.isPerspectiveMode === true) {
      return;
    }

    this.updateMousePos(event);

    this.raycaster.setFromCamera(this.mouse, this.camera.get());

    const intersectPoint = new THREE.Vector3();

    this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint);

    intersectPoint.sub(this.offset);

    const delta = new THREE.Vector3().subVectors(intersectPoint, Stick.selectedStick.get().position);

    for (const stick of Stick.selectedStick.cluster) {
      stick.get().position.add(delta);

      stick.get().updateMatrixWorld(true);
    }

    const SNAP_THRESHOLD = 1.0;
    let snapped = false;

    const movingEnds = Stick.selectedStick.getEndPoints();

    for (const stick of this.sticks) {
      if(stick.cluster == Stick.selectedStick.cluster) { continue }

      const targetEnds = stick.getEndPoints();

      for(const mEnds of movingEnds) {
        for(const tEnds of targetEnds) {
          const distance = mEnds.distanceTo(tEnds);

          if(distance < SNAP_THRESHOLD) {
            const snapOffset = new THREE.Vector3().subVectors(tEnds, mEnds);

            for (const clusterStick of Stick.selectedStick.cluster) {
              clusterStick.get().position.add(snapOffset);
              clusterStick.get().updateMatrixWorld(true);
            }

            this.offset.sub(snapOffset);

            for(const s of Stick.selectedStick.cluster) {
              stick.cluster.add(s);
              s.cluster = stick.cluster;
            }

            snapped = true;
            break;
          }
        }

        if (snapped === true) { break }
      }

      if (snapped === true) { break }
    }
  }

  onPointerUp(event) {
    if (event.button === 0 && Stick.selectedStick !== null) {
      for (const stick of Stick.selectedStick.cluster) {
        stick.deselect();
      }
      Stick.selectedStick = null;
    }
  }
}
