import * as THREE from "three";

import { Graph } from "./Graph.js";
import { Stick } from "./Stick.js";
import { Camera } from "./Camera.js";
import { Interface } from "./Interface.js";

window.addEventListener("contextmenu", (event) => event.preventDefault());

main();

function main() {
  const canvas = document.querySelector("#canvas");
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdddddd);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const light = new THREE.DirectionalLight(0xffffff, 10.0);
  light.position.set(10, 10, 10);

  scene.add(light);
  scene.add(ambientLight);

  const camera = new Camera(canvas.clientWidth / canvas.clientHeight);

  const graph = new Graph(canvas);
  scene.add(graph.get());

  const ui = new Interface ({
    addStick: addStick,
    toggleCamera: toggleCamera
  });

  loop();





  function loop() {
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      camera.resize(canvas.clientWidth / canvas.clientHeight);
    }

    requestAnimationFrame(loop);

    renderer.render(scene, camera.get());
  }

  function toggleCamera() {
    camera.isPerspectiveMode = !camera.isPerspectiveMode;

    if (camera.isPerspectiveMode) {
      scene.background = new THREE.Color(0x333333);
      graph.gridLines.visible = false;
    }
    else {
      scene.background = new THREE.Color(0xdddddd);
      graph.gridLines.visible = true;
    }
  }

  function addStick() {
    const newStick = new Stick(canvas, camera);
    scene.add(newStick.get());
  }
}
