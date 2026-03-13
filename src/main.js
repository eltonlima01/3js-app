import * as THREE from "three";

import {Graph} from "../model/Graph.js"
import {Camera} from "../utils/Camera.js";

main ();

function main ()
{
    const scene = new THREE.Scene ();
    scene.background = new THREE.Color (0x888888);

    const canvas = document.querySelector ("#c");
    const renderer = new THREE.WebGLRenderer ({canvas: canvas});

////////////////////////////////////////////////////////////////

    const camera = new Camera (canvas);

    window.addEventListener ("keydown", (event) =>
    {
        if (event.key.toLowerCase () === "c")
        {
            camera.isPerspectiveMode = !camera.isPerspectiveMode;

            camera.isPerspectiveMode === true ?
            graph.get ().rotation.x = -Math.PI / 2 : graph.get ().rotation.x = 0;
        }
    })

    const graph = new Graph (canvas);
    scene.add (graph.get ());

    const geometry = new THREE.BoxGeometry (0.0965, 0.3915, 6.0015);
    const material = new THREE.MeshPhongMaterial ({color: 0xeeee00});

    const stick = new THREE.Mesh (geometry, material);
    stick.rotation.x = 0.5;
    stick.rotation.y = 0.5;

    const ambientLight = new THREE.AmbientLight (0x888888, 2.5);

    const light = new THREE.DirectionalLight (0xffffff, 5);
    light.position.set (5, 5, 5);

    scene.add (stick);
    scene.add (light);
    scene.add (ambientLight);

    function animate ()
    {
        if (resizeRendererToDisplaySize (canvas, renderer)) {
            camera.resize (canvas);
        }

        requestAnimationFrame (animate);

        renderer.render (scene, camera.get ());
    }

    animate ();
}

////////////////////////////////////////////////////////////////

function resizeRendererToDisplaySize (canvas, renderer)
{
    const needResize = canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight;

    if (needResize) {
        renderer.setSize (canvas.clientWidth, canvas.clientHeight, false);
    }

    return needResize;
}