import * as THREE from "three";

import {Graph} from "../models/Graph.js"
import {Stick} from "../models/Stick.js"
import {Camera} from "../utils/Camera.js";

main ();

function main ()
{
    const scene = new THREE.Scene ();
    scene.background = new THREE.Color (0x888888);

    const canvas = document.querySelector ("#c");
    const renderer = new THREE.WebGLRenderer ({canvas: canvas, antialias: true});

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

    const stick = new Stick (canvas, camera);
    scene.add (stick.get ());

    ////////////////////////////////

    const ambientLight = new THREE.AmbientLight (0x888888, 2.5);

    const light = new THREE.DirectionalLight (0xffffff, 5);
    light.position.set (0, 10, 0);

    scene.add (light);
    scene.add (ambientLight);

    ////////////////////////////////

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