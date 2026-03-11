import * as THREE from 'three';

let isDragging = false;
let previousMousePosition = {x: 0, y: 0};

let angleXZ = Math.PI / 2;
let angleY = 0;
const radius = 10;

main ();

function main ()
{
    const renderer = new THREE.WebGLRenderer ();
    renderer.setSize (window.innerWidth , window.innerHeight);

    document.body.appendChild (renderer.domElement);

    const scene = new THREE.Scene ();

    const camera = new THREE.PerspectiveCamera (45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 10;

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

    window.addEventListener ('contextmenu', (event) => event.preventDefault ());

    window.addEventListener ('mousedown', (event) =>
    {
        if (event.button === 2) {
            isDragging = true;

            previousMousePosition = {x: event.clientX, y: event.clientY};
        }
    });

    window.addEventListener ('mouseup', (event) => {
        if (event.button === 2) {
            isDragging = false;
        }
    });

    window.addEventListener ('mouseleave', (event) => {isDragging = false;});

    window.addEventListener ('mousemove', (event) =>
    {
        if (isDragging)
        {
            const deltaMove = {
                x: event.clientX - previousMousePosition.x,
                y: event.clientY - previousMousePosition.y
            };

            angleY += deltaMove.y * 0.005;
            angleXZ += deltaMove.x * 0.005;

            const maxPitch = (Math.PI / 2) * 0.99;
            angleY = Math.max (-maxPitch, Math.min (maxPitch, angleY));

            camera.position.x = radius * Math.cos (angleXZ) * Math.cos (angleY);
            camera.position.y = radius * Math.sin (angleY);
            camera.position.z = radius * Math.sin (angleXZ) * Math.cos (angleY);

            camera.lookAt (0, 0, 0);

            previousMousePosition = {x: event.clientX, y: event.clientY};
        }
    })

    window.addEventListener ('wheel', (event) =>
    {
        camera.fov += event.deltaY * 0.05;
        camera.fov = Math.max (10, Math.min (camera.fov, 120));
        
        camera.updateProjectionMatrix ();
    });

    function animate () {
        requestAnimationFrame (animate);

        renderer.render (scene, camera);
    }

    animate ();
}