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

    this.basePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this.placingStick = null;

    this.events();
  }

  startPlacing(stick, event) {
    this.placingStick = stick;

    if (!this.sticks.includes(stick)) {
      this.sticks.push(stick);
    }

    this.placingStick.select();

    if (event && event.clientX) {
      this.updateMousePos(event);
      this.raycaster.setFromCamera(this.mouse, this.camera.get());
      this.raycaster.ray.intersectPlane(this.basePlane, this.placingStick.get().position);
    }
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

    if (this.placingStick) {
      if (event.button === 0) {
        this.placingStick.deselect();
        this.placingStick = null;
      }
      else if (event.button === 2) {
        this.placingStick.get().removeFromParent();

        const index = this.sticks.indexOf(this.placingStick);

        if (index > -1) {
          this.sticks.splice(index, 1);
        }

        this.placingStick = null;
      }

      return;
    }

    this.updateMousePos(event);

    this.raycaster.setFromCamera(this.mouse, this.camera.get());

    const stickGroups = this.sticks.map((stick) => stick.get());
    const intersects = this.raycaster.intersectObjects(stickGroups, true);

    if (intersects.length > 0.0) {
      const hitStick = intersects[0].object.parent?.userData?.instance;

      if (!hitStick) { return }

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
        Stick.isSelected = true;

        if (!Stick.selectedStick.cluster) {
          Stick.selectedStick.cluster = new Set([Stick.selectedStick]);
        }

        for(const stick of Stick.selectedStick.cluster) {
          stick.select();
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
    if (this.camera.isPerspectiveMode) { return }

    if (this.placingStick) {
      this.updateMousePos(event);

      this.raycaster.setFromCamera(this.mouse, this.camera.get());
      this.raycaster.ray.intersectPlane(this.basePlane, this.placingStick.get().position);

    Stick.SNAP_THRESHOLD = 1.0;
    let snapped = false;

    const movingEnds = this.placingStick.getEndPoints();

    for (const stick of this.sticks) {
      if(stick.cluster == this.placingStick.cluster) { continue }

      const targetEnds = stick.getEndPoints();

      for(const mEnds of movingEnds) {
        for(const tEnds of targetEnds) {
          const distance = mEnds.distanceTo(tEnds);

          if(distance < Stick.SNAP_THRESHOLD) {
            const snapOffset = new THREE.Vector3().subVectors(tEnds, mEnds);

            for (const clusterStick of this.placingStick.cluster) {
              clusterStick.get().position.add(snapOffset);
              clusterStick.get().updateMatrixWorld(true);
            }

            this.offset.sub(snapOffset);

            for(const s of this.placingStick.cluster) {
              stick.cluster.add(s);
              s.cluster = stick.cluster;
            }

            snapped = true;

            for (const clusterStick of this.placingStick.cluster) {
              clusterStick.deselect();
            }

            this.placingStick = null;
            Stick.isSelected = false;
            break;
          }
        }

        if (snapped === true) { break }
      }

      if (snapped === true) { break }
    }

      return;
    }
    
    if (!Stick.selectedStick || !Stick.isSelected) { return }

    this.updateMousePos(event);

    this.raycaster.setFromCamera(this.mouse, this.camera.get());

    const intersectPoint = new THREE.Vector3();
    const hit = this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint);

    if (!hit) {
      return;
    }

    this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint);

    intersectPoint.sub(this.offset);

    const delta = new THREE.Vector3().subVectors(intersectPoint, Stick.selectedStick.get().position);

    for (const stick of Stick.selectedStick.cluster) {
      stick.get().position.add(delta);

      stick.get().updateMatrixWorld(true);
    }

    Stick.SNAP_THRESHOLD = 1.0;
    let snapped = false;

    const movingEnds = Stick.selectedStick.getEndPoints();

    for (const stick of this.sticks) {
      if(stick.cluster == Stick.selectedStick.cluster) { continue }

      const targetEnds = stick.getEndPoints();

      for(const mEnds of movingEnds) {
        for(const tEnds of targetEnds) {
          const distance = mEnds.distanceTo(tEnds);

          if(distance < Stick.SNAP_THRESHOLD) {
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

            for (const clusterStick of Stick.selectedStick.cluster) {
              clusterStick.deselect();
            }

            Stick.selectedStick = null;
            Stick.isSelected = false;
            break;
          }
        }

        if (snapped === true) { break }
      }

      if (snapped === true) { break }
    }
  }

  onPointerUp(event) {
    if (event.button === 0 && Stick.selectedStick && Stick.isSelected) {
      if (Stick.selectedStick.cluster) {
        for (const stick of Stick.selectedStick.cluster) {
          stick.deselect();
        }
      }

      Stick.selectedStick = null;
      Stick.isSelected = false;
    }
  }
}
