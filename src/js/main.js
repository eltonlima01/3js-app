import * as THREE from "three";

import { Graph } from "./Graph.js";
import { Stick } from "./Stick.js";
import { Camera } from "./Camera.js";
import { Interface } from "./Interface.js";
import { RayCaster } from "./RayCaster.js";

window.addEventListener("contextmenu", (event) => event.preventDefault());

main();

function main() {
  const canvas = document.querySelector("#canvas");
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);

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
      currentGap = gap;

      stick.setGap(currentGap);
    });
  }

  const ui = new Interface({
    newStick: newStick,
    deleteStick: deleteStick,
    separateStick: separateStick,
    changeGap: changeGap,
    toggleCamera: toggleCamera
  });

  const raycaster = new RayCaster(canvas, camera, sticks);

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
      scene.background = new THREE.Color(0x111111);
      graph.gridLines.visible = false;
    } else {
      scene.background = new THREE.Color(0xdddddd);
      graph.gridLines.visible = true;
    }
  }

  function newStick(event) {
    const newStick = new Stick(currentGap);
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
}
