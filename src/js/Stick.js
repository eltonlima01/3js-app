import * as THREE from "three";

export class Stick {
  static selected = false;
  static selectedStick = null;

  static DEFAULT_MASS = 1.5;

  static DEFAULT_WIDTH = 0.193;
  static DEFAULT_HEIGHT = 0.783;
  static DEFAULT_DEPTH = 12.003;

  static DEFAULT_COLOR = 0xffff00;

  static geometry = new THREE.BoxGeometry (
    Stick.DEFAULT_WIDTH,
    Stick.DEFAULT_HEIGHT,
    Stick.DEFAULT_DEPTH
  );

    static edgesGeometry = new THREE.EdgesGeometry(Stick.geometry);
    static edgesMaterial = new THREE.LineBasicMaterial({color: 0x222222});

  static SNAP_THRESHOLD = 1.0;

  constructor() {
    this.group = new THREE.Group();
    this.group.userData.instance = this;

    this.cluster = new Set([this]);

    this.material = new THREE.MeshStandardMaterial({
      color: Stick.DEFAULT_COLOR,
      roughness: 0.75,
      metalness: 0.0,
    });

    const edgesFront = new THREE.LineSegments(Stick.edgesGeometry, Stick.edgesMaterial);
    edgesFront.raycast = () => {};

    this.meshFront = new THREE.Mesh(Stick.geometry, this.material);

    this.meshFront.add(edgesFront);
    this.meshFront.rotation.y = Math.PI / 2;
    this.meshFront.position.z = -Stick.DEFAULT_DEPTH / 2.0;

    const edgesBack = new THREE.LineSegments(Stick.edgesGeometry, Stick.edgesMaterial);
    edgesBack.raycast = () => {};

    this.meshBack = new THREE.Mesh(Stick.geometry, this.material);

    this.meshBack.add(edgesBack);
    this.meshBack.rotation.y = Math.PI / 2;
    this.meshBack.position.z = Stick.DEFAULT_DEPTH / 2.0;

    this.group.add(this.meshFront);
    this.group.add(this.meshBack);
  }

  get() { return this.group }

  getAngle() { return this.group.rotation.z * (180.0 / Math.PI) }
  setAngle(degrees) { this.group.rotation.z = degrees * (Math.PI / 180.0) }

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
    const halfDepth = Stick.DEFAULT_DEPTH / 2.0;

    const left = new THREE.Vector3(-halfDepth, 0, 0);
    const right = new THREE.Vector3(halfDepth, 0, 0);

    this.group.localToWorld(left);
    this.group.localToWorld(right);

    return [ left, right ];
  }

  setStressColor (force) {
    if (force === null) {
      this.material.color.setHex (0x222222);
      this.material.needsUpdate = true;

      return;
    }

    if (Math.abs (force) < 0.0001) { this.material.color.setHex (0x777777) }
    else if (force > 0.0) { this.material.color.setHex (0x0000ff) }
    else { this.material.color.setHex (0xff0000) }

    this.material.transparent = false;
    this.material.opacity = 1.0;
    this.material.needsUpdate = true;
  }

  saveOriginalState () {
    if (!this.originalState) {
      this.originalState = {
        x: this.group.position.x,
        y: this.group.position.y,
        z: this.group.position.z,
        angle: this.group.rotation.z,
        scale: this.group.scale.x
      }
    }
  }

  resetState() {
    if (this.originalState) {
      this.group.position.set(this.originalState.x, this.originalState.y, this.originalState.z);
      this.group.rotation.z = this.originalState.angle;
      this.group.scale.x = this.originalState.scale;
    }
  }

  resetColor () {
    this.material.color.setHex (Stick.DEFAULT_COLOR);
    this.material.needsUpdate = true;
  }
}
