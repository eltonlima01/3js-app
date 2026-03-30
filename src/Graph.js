import * as THREE from "three";

export class Graph {
  constructor() {
    this.group = new THREE.Group();

    const grid_material = new THREE.LineBasicMaterial({ color: 0x333333 });
    const xAxis_material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const yAxis_material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const zAxis_material = new THREE.LineBasicMaterial({ color: 0x0000ff });

    const limit = 100;

    const grid_points = [];
    const yAxis_points = [];
    const xAxis_points = [];
    const zAxis_points = [];

    for (let i = -limit; i < 0; i++) {
      grid_points.push(new THREE.Vector3(i, -limit, 0));
      grid_points.push(new THREE.Vector3(i, limit, 0));

      grid_points.push(new THREE.Vector3(-limit, i, 0));
      grid_points.push(new THREE.Vector3(limit, i, 0));
    }

    xAxis_points.push(new THREE.Vector3(-limit, 0, 0));
    xAxis_points.push(new THREE.Vector3(limit, 0, 0));

    yAxis_points.push(new THREE.Vector3(0, -limit, 0));
    yAxis_points.push(new THREE.Vector3(0, limit, 0));

    zAxis_points.push(new THREE.Vector3(0, 0, -limit));
    zAxis_points.push(new THREE.Vector3(0, 0, limit));

    for (let i = 1; i <= limit; i++) {
      grid_points.push(new THREE.Vector3(i, -limit, 0));
      grid_points.push(new THREE.Vector3(i, limit, 0));

      grid_points.push(new THREE.Vector3(-limit, i, 0));
      grid_points.push(new THREE.Vector3(limit, i, 0));
    }

    const grid_geometry = new THREE.BufferGeometry().setFromPoints(grid_points);
    const xAxis_geometry = new THREE.BufferGeometry().setFromPoints(
      xAxis_points,
    );
    const yAxis_geometry = new THREE.BufferGeometry().setFromPoints(
      yAxis_points,
    );
    const zAxis_geometry = new THREE.BufferGeometry().setFromPoints(
      zAxis_points,
    );

    const grid_lines = new THREE.LineSegments(grid_geometry, grid_material);
    const xAxis_lines = new THREE.LineSegments(xAxis_geometry, xAxis_material);
    const yAxis_lines = new THREE.LineSegments(yAxis_geometry, yAxis_material);
    const zAxis_lines = new THREE.LineSegments(zAxis_geometry, zAxis_material);

    this.group.add(grid_lines);
    this.group.add(xAxis_lines);
    this.group.add(yAxis_lines);
    this.group.add(zAxis_lines);
  }

  get() {
    return this.group;
  }
}
