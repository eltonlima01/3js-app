import * as THREE from "three";

const STICK_COLOR = 0xffff00;

const STICK_HALF_WIDTH = 0.0965;
const STICK_HALF_HEIGHT = 0.3915;
const STICK_HALF_DEPTH = 6.0015;

export class Stick {
  static selectedStick = null;
  static isSelected = false;

  constructor(gap = 1.0) {
    this.group = new THREE.Group();
    this.group.userData.instance = this;

    this.cluster = new Set([this]);

    const geometry = new THREE.BoxGeometry(
      STICK_HALF_WIDTH,
      STICK_HALF_HEIGHT,
      STICK_HALF_DEPTH,
    );
    this.material = new THREE.MeshStandardMaterial({
      color: STICK_COLOR,
      roughness: 0.75,
      metalness: 0.0,
    });

    this.meshFront = new THREE.Mesh(geometry, this.material);
    this.meshFront.rotation.y = Math.PI / 2;
    this.meshFront.position.z = -gap;

    this.meshBack = new THREE.Mesh(geometry, this.material);
    this.meshBack.rotation.y = Math.PI / 2;
    this.meshBack.position.z = gap;

    this.group.add(this.meshFront);
    this.group.add(this.meshBack);
  }

  get() {
    return this.group;
  }

  getAngle() {
    return this.group.rotation.z * (180.0 / Math.PI);
  }

  setAngle(degrees) {
    this.group.rotation.z = degrees * (Math.PI / 180.0);
  }

  setGap(gap) {
    this.meshFront.position.z = -gap;
    this.meshBack.position.z = gap;
  }

  select() {
    this.material.color.setHex(0xffaa00);
    this.material.transparent = true;
    this.material.opacity = 0.6;
    this.material.needsUpdate = true;
  }

  deselect() {
    this.material.color.setHex(0xeeee00);
    this.material.opacity = 1.0;
    this.material.transparent = false;
    this.material.needsUpdate = true;
  }

  getEndPoints() {
    const halfDepth = STICK_HALF_DEPTH / 2.0;

    const left = new THREE.Vector3(-halfDepth, 0, 0);
    const right = new THREE.Vector3(halfDepth, 0, 0);

    this.group.localToWorld(left);
    this.group.localToWorld(right);

    return [ left, right ];
  }
}
