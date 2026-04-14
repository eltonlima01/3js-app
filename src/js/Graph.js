import * as THREE from "three";

export class Graph {
  constructor() {
    this.group = new THREE.Group();

    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });
    const xAxisMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const yAxisMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const zAxisMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });

    const limit = 100;

    const gridPoints = [];
    const yAxisPoints = [];
    const xAxisPoints = [];
    const zAxisPoints = [];

    for (let i = -limit; i < 0; i++) {
      gridPoints.push(new THREE.Vector3(i, -limit, 0));
      gridPoints.push(new THREE.Vector3(i, limit, 0));

      gridPoints.push(new THREE.Vector3(-limit, i, 0));
      gridPoints.push(new THREE.Vector3(limit, i, 0));
    }

    xAxisPoints.push(new THREE.Vector3(-limit, 0, 0));
    xAxisPoints.push(new THREE.Vector3(limit, 0, 0));

    yAxisPoints.push(new THREE.Vector3(0, -limit, 0));
    yAxisPoints.push(new THREE.Vector3(0, limit, 0));

    zAxisPoints.push(new THREE.Vector3(0, 0, -limit));
    zAxisPoints.push(new THREE.Vector3(0, 0, limit));

    for (let i = 1; i <= limit; i++) {
      gridPoints.push(new THREE.Vector3(i, -limit, 0));
      gridPoints.push(new THREE.Vector3(i, limit, 0));

      gridPoints.push(new THREE.Vector3(-limit, i, 0));
      gridPoints.push(new THREE.Vector3(limit, i, 0));
    }

    const gridGeometry = new THREE.BufferGeometry().setFromPoints(gridPoints);
    const xAxisGeometry = new THREE.BufferGeometry().setFromPoints(
      xAxisPoints,
    );
    const yAxisGeometry = new THREE.BufferGeometry().setFromPoints(
      yAxisPoints,
    );
    const zAxisGeometry = new THREE.BufferGeometry().setFromPoints(
      zAxisPoints,
    );

    this.gridLines = new THREE.LineSegments(gridGeometry, gridMaterial);

    const xAxisLines = new THREE.LineSegments(xAxisGeometry, xAxisMaterial);
    const yAxisLines = new THREE.LineSegments(yAxisGeometry, yAxisMaterial);
    const zAxisLines = new THREE.LineSegments(zAxisGeometry, zAxisMaterial);

    const textCanvas = document.createElement("canvas");
    textCanvas.width = 128;
    textCanvas.height = 128;

    const ctx = textCanvas.getContext("2d");

    ctx.font = "bold 60px Arial";
    ctx.fillStyle = "#333333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText ("0", 64, 64);

    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTexture.minFilter = THREE.LinearFilter;

    const spriteMaterial = new THREE.SpriteMaterial({
      map: textTexture,
      transparent: true,
      depthTest: false
    });

    this.zeroSprite = new THREE.Sprite(spriteMaterial);
    this.zeroSprite.scale.set(1.5, 1.5, 1);
    this.zeroSprite.position.set(0.0, 0.0, 0.0);

    this.group.add(this.gridLines);
    this.group.add(xAxisLines);
    this.group.add(yAxisLines);
    this.group.add(zAxisLines);
    this.group.add(this.zeroSprite);
  }

  get() {
    return this.group;
  }
}
