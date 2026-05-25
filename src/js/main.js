import * as THREE from "three";

import { Graph } from "./Graph.js";
import { Stick } from "./Stick.js";
import { Camera } from "./Camera.js";
import { Interface } from "./Interface.js";
import { RayCaster } from "./RayCaster.js";
import { PhysicsEngine } from "./PhysicsEngine.js";

window.addEventListener("contextmenu", (event) => event.preventDefault());

main();

function main() {
  const canvas = document.querySelector("#canvas");
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdddddd);

  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x333333, 2.0);
  const light = new THREE.DirectionalLight(0xffffff, 1.0);
  light.position.set(10, 10, 10);

  scene.add(light);
  scene.add(hemisphereLight);

  const camera = new Camera(canvas.clientWidth / canvas.clientHeight);

  const graph = new Graph(canvas);
  scene.add(graph.get());

  let currentGap = 1.0;
  const sticks = [];

  function changeGap(gap) {
    sticks.forEach((stick) => {
      stick.setGap(gap);
    });
  }

  const ui = new Interface({
    newStick: newStick,
    deleteStick: deleteStick,
    separateStick: separateStick,
    changeGap: changeGap,
    toggleCamera: toggleCamera,
    analyzeBridge: analyzeBridge
  });

  const raycaster = new RayCaster(canvas, camera, sticks);
  const physicsEngine = new PhysicsEngine(1.0);

  let debugSpheres = [];

  loop();

  function loop() {
    if (
      canvas.width !== canvas.clientWidth ||
      canvas.height !== canvas.clientHeight
    ) {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      camera.resize(canvas.clientWidth / canvas.clientHeight);
    }

    requestAnimationFrame(loop);

    renderer.render(scene, camera.get());
  }

  function toggleCamera() {
    camera.isPerspectiveMode = !camera.isPerspectiveMode;

    if (camera.isPerspectiveMode) {
      graph.gridLines.visible = false;
    } else {
      graph.gridLines.visible = true;
    }
  }

  function newStick(event) {
    const newStick = new Stick(currentGap);
    newStick.cluster = new Set ([newStick]);

    scene.add(newStick.get());

    raycaster.startPlacing(newStick, event);
  }

  function deleteStick(stick) {
    scene.remove(stick.get());

    const index = sticks.indexOf(stick);

    if (index > -1) {
      sticks.splice(index, 1);
    }
  }

  function separateStick(stick, event) {
    if (stick.cluster) {
      stick.cluster.delete(stick);
    }

    stick.cluster = new Set([stick]);
    raycaster.startPlacing(stick, event);
  }

  function analyzeBridge () {
    if (sticks.length === 0) return;

    let mainCluster = sticks[0].cluster;

    sticks.forEach ((stick) => {
      stick.resetColor ();

      if (stick.resetState) { stick.resetState () }
      if (stick.saveOriginalState) { stick.saveOriginalState () }

      if (stick.cluster.size > mainCluster.size) { mainCluster = stick.cluster }
    });

    const data = physicsEngine.analyzeCluster(mainCluster);

    if (data) {
      debugSpheres.forEach(sphere => scene.remove(sphere));
      debugSpheres = [];

      const DEFORMATION_SCALE = 30000.0;

      data.nodes.forEach(node => {
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);

        let color = 0x00ff00;

        if (node.isSupport) { color = node.supportType === "fixed" ? 0xff0000 : 0x0000ff }

        const material = new THREE.MeshBasicMaterial({color: color, depthTest : false});
        const sphere = new THREE.Mesh(geometry, material);

        const newX = node.x + (node.dispX * DEFORMATION_SCALE);
        const newY = node.y + (node.dispY * DEFORMATION_SCALE);

        sphere.position.set(newX, newY, 0);
        sphere.renderOrder = 999;

        scene.add(sphere);
        debugSpheres.push(sphere);
      });

      if (data.elements) {
        data.elements.forEach (element => {
          element.stick.setStressColor (element.force);

          const newAx = element.nodeA.x + (element.nodeA.dispX * DEFORMATION_SCALE);
          const newAy = element.nodeA.y + (element.nodeA.dispY * DEFORMATION_SCALE);

          const newBx = element.nodeB.x + (element.nodeB.dispX * DEFORMATION_SCALE);
          const newBy = element.nodeB.y + (element.nodeB.dispY * DEFORMATION_SCALE);

          const dx = newBx - newAx;
          const dy = newBy - newAy;

          const midX = (newAx + newBx) / 2.0;
          const midY = (newAy + newBy) / 2.0;

          element.stick.group.position.set (midX, midY, element.stick.group.position.z);
          element.stick.group.rotation.z = Math.atan2 (dy, dx);
          element.stick.group.scale.x = Math.hypot (dx, dy) / Stick.HALF_DEPTH;
      });
    }
  }
}}
