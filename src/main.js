import * as THREE from "three";

import { Graph } from "./Graph.js";
import { Stick } from "./Stick.js";
import { Camera } from "./Camera.js";
import { Interface } from "./Interface.js";

window.addEventListener("contextmenu", (event) => event.preventDefault());

main();

function main() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  const canvas = document.querySelector("#canvas");
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

  const camera = new Camera(canvas.clientWidth / canvas.clientHeight);

  const graph = new Graph(canvas);
  scene.add(graph.get());

  function toggleCamera() {
    camera.isPerspectiveMode = !camera.isPerspectiveMode;
    camera.isPerspectiveMode === true? graph.get().visible = false : graph.get().visible = true;
  }

  function addStick() {
    const newStick = new Stick(canvas, camera);
    scene.add(newStick.get());
  }

  controls(scene, canvas, camera, graph);

  const ui = new Interface ({
    addStick: addStick,
    toggleCamera: toggleCamera
  });

  const ambientLight = new THREE.AmbientLight(0x888888, 2.5);

  const light = new THREE.DirectionalLight(0xffffff, 5);
  light.position.set(0, 10, 0);

  scene.add(light);
  scene.add(ambientLight);

  function animate() {
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      camera.resize(canvas.clientWidth / canvas.clientHeight);
    }

    requestAnimationFrame(animate);

    renderer.render(scene, camera.get());
  }

  animate();
}

function controls(scene, canvas, camera, graph) {
  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "c") {
      camera.isPerspectiveMode = !camera.isPerspectiveMode;

      camera.isPerspectiveMode === true
        ? (graph.get().rotation.x = -Math.PI / 2)
        : (graph.get().rotation.x = 0);
    }

    if (event.key.toLowerCase() === "e") {
      const newStick = new Stick(canvas, camera);
      scene.add(newStick.get());
    }
  });
}
