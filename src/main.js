import * as THREE from "three";

import { Graph } from "./Graph.js";
import { Stick } from "./Stick.js";
import { Camera } from "./Camera.js";

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

  const btnStick = document.getElementById("stick-btn");
  const btnCamera = document.getElementById("camera-btn");

  btnStick.addEventListener("pointerdown", (event) => event.stopPropagation());
  btnCamera.addEventListener("pointerdown", (event) => event.stopPropagation());

  btnStick.addEventListener("click", addStick);
  btnCamera.addEventListener("click", toggleCamera);

  let activeStick = null;
  const contextMenu = document.getElementById("context-menu");

  const angleSlider = document.getElementById("angle-slider");
  const angleDisplay = document.getElementById("angle-display");

  const lengthSlider = document.getElementById("length-slider");
  const lengthDisplay = document.getElementById("length-display");

  window.addEventListener("openContextMenu", (event) => {
    activeStick = event.detail.stick;

    contextMenu.style.left = `${event.detail.x}px`;
    contextMenu.style.top = `${event.detail.y}px`;
    contextMenu.classList.add("active");

    angleSlider.value = Math.round(activeStick.getAngle());
    angleDisplay.innerText = `${angleSlider.value}°`;

    lengthSlider.value = activeStick.get().scale.x;
    lengthDisplay.innerText = (activeStick.get().scale.x).toFixed(1);
  });

  angleSlider.addEventListener("input", (event) => {
    if (activeStick !== null) {
      activeStick.setAngle(event.target.value);
      angleDisplay.innerText = `${event.target.value}°`;
    }
  });

  lengthSlider.addEventListener("input", (event) => {
    if (activeStick !== null) {
      const newLength = parseFloat(event.target.value);
      activeStick.get().scale.x = newLength;
      lengthDisplay.innerText = newLength;
    }
  })

  contextMenu.addEventListener("pointerdown", (event) =>
    event.stopPropagation(),
  );

  window.addEventListener("pointerdown", (event) => {
    if (event.button === 0) {
      contextMenu.classList.remove("active");
      activeStick = null;
    }
  });

  const ambientLight = new THREE.AmbientLight(0x888888, 2.5);

  const light = new THREE.DirectionalLight(0xffffff, 5);
  light.position.set(0, 10, 0);

  scene.add(light);
  scene.add(ambientLight);

  function animate() {
    if (resizeRendererToDisplaySize(canvas, renderer)) {
      camera.resize(canvas.clientWidth / canvas.clientHeight);
    }

    requestAnimationFrame(animate);

    renderer.render(scene, camera.get());
  }

  animate();
}

function resizeRendererToDisplaySize(canvas, renderer) {
  const needResize =
    canvas.width !== canvas.clientWidth ||
    canvas.height !== canvas.clientHeight;

  if (needResize) {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  }

  return needResize;
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
