import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';


// Create a scene
const scene = new THREE.Scene();

// Get canvas
const canvas = document.getElementById('3DView');
const width = canvas.clientWidth;
const height = canvas.clientHeight;

// Create a camera
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set( 10, 10, 0);
camera.lookAt( 0, 0, 0 );

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
canvas.appendChild(renderer.domElement);

// Create a light that castShadow
let light = new THREE.DirectionalLight( 0xFFFFFF, 3.0 );
light.position.set( 0.32, 0.39, 0.7 );

let ambientLight = new THREE.AmbientLight( 0x7c7c7c, 3.0 );

scene.add( ambientLight );
scene.add( light );

let loader = new OBJLoader();
loader.load(
    // ścieżka do Twojego pliku OBJ
    '../models/sandal.obj',
    // funkcja wywoływana po załadowaniu
    function (object) {
        scene.add(object);
        object.position.set(0, 0, 0);
    },
    // opcjonalnie: funkcja wywoływana w trakcie ładowania
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // opcjonalnie: funkcja wywoływana przy wystąpieniu błędu
    function (error) {
        console.log('An error happened');
    }
);

// Animation loop
function animate() {
    requestAnimationFrame(animate);


    // Render the scene with the camera
    renderer.render(scene, camera);
}

// Start the animation loop
animate();