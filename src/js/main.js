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

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const dragPlane = new THREE.Plane();
  const offset = new THREE.Vector3();
  const planeNormal = new THREE.Vector3(0, 0, 0);

  let selectedStick = null;



  function changeGap(gap) {
    sticks.forEach((stick) => {
      currentGap = gap;

      stick.setGap(currentGap);
    });
  }

  const ui = new Interface ({
    addStick: addStick,
    toggleCamera: toggleCamera,
    changeGap: changeGap
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
      scene.background = new THREE.Color(0x111111);
      graph.gridLines.visible = false;
    }
    else {
      scene.background = new THREE.Color(0xdddddd);
      graph.gridLines.visible = true;
    }
  }

  function addStick() {
    const newStick = new Stick(currentGap);
    scene.add(newStick.get());
    sticks.push(newStick);
  }

  function updateMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (((event.clientX - rect.left) / rect.width) * 2.0) - 1.0;
    mouse.y = -(((event.clientY - rect.top) / rect.height) * 2.0) + 1.0;
  }

  window.addEventListener("pointerdown", (event) => {
    if (camera.isPerspectiveMode === true) {
      return;
    }

    updateMousePos(event);

    raycaster.setFromCamera(mouse, camera.get());

    const stickGroups = sticks.map(stick => stick.get());
    const intersects = raycaster.intersectObjects(stickGroups, true);

    if(intersects.length > 0.0) {
      const hitStick = intersects[0].object.parent.userData.instance;

      if(event.button === 2) {
        event.stopPropagation();

        window.dispatchEvent(
          new CustomEvent("openContextMenu", { detail: { stick: hitStick, x: event.clientX, y: event.clientY } })
        );

        return;
      }

      if(event.button === 0) {
        selectedStick = hitStick;
        selectedStick.select();

        dragPlane.setFromNormalAndCoplanarPoint(camera.get().getWorldDirection(planeNormal), selectedStick.get().position);

        raycaster.ray.intersectPlane(dragPlane, offset);
        offset.sub(selectedStick.get().position);
      }
    }
  });

  window.addEventListener("pointermove", (event) =>{
    if ((selectedStick === null) || (camera.isPerspectiveMode === true))  {
      return;
    }

    updateMousePos(event);

    raycaster.setFromCamera(mouse, camera.get());

    const intersectPoint = new THREE.Vector3();

    raycaster.ray.intersectPlane(dragPlane, intersectPoint);

    selectedStick.get ().position.copy(intersectPoint.sub (offset));
  });

  window.addEventListener("pointerup", (event) => {
    if((event.button === 0) && (selectedStick !== null)) {
      selectedStick.deselect();
      selectedStick = null;
    }
  })
}
