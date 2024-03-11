import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Create a scene
const scene = new THREE.Scene();

// Get canvas
const canvas = document.getElementById('3DView');
const width = canvas.clientWidth;
const height = canvas.clientHeight;

// Get controls
const moveToHomeButton = document.getElementById('moveToHomeButton');
const moveForward = document.getElementById('sd');

// Create a camera
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set( 7, 7, 12);
camera.lookAt( 0, 0, 0 );

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
canvas.appendChild(renderer.domElement);

// Create a light that castShadow
let light = new THREE.DirectionalLight( 0xFFFFFF, 2.0 );
light.position.set( 0.32, 0.39, 0.7 );
let ambientLight = new THREE.AmbientLight( 0x7c7c7c, 3.0 );
scene.add( ambientLight );
scene.add( light );

// controls
let cameraControls = new OrbitControls( camera, renderer.domElement );
cameraControls.addEventListener( 'change', render );

let joints = [];

let loader = new OBJLoader();

let filenames = [
    "base-axis",
    "Z-axis",
    "J1-axis",
    "J2-axis",
];

function loadModel(filename) {
    return new Promise((resolve, reject) => {
        loader.load(`../models/${filename}.obj`, function(object) {
            object.scale.set(0.01, 0.01, 0.01); // Skaluj załadowany model
            resolve(object); // Rozwiązanie Promise obiektem
        }, undefined, function(error) {
            reject(error); // Odrzucenie Promise w przypadku błędu
        });
    });
}

async function setupAxes() {
    for(let i = 0; i < filenames.length; i++) {
        try {
            const object = await loadModel(filenames[i]); // Czekaj na załadowanie modelu
            scene.add(object); // Dodaj model do sceny
            joints.push(object); // Dodaj obiekt do tablicy
        } catch (error) {
            console.error(`Error loading model ${filenames[i]}:`, error);
        }
    }


    joints[1].position.set(0, 0.8, 0)
    joints[2].position.set(0, 3, 0)
    joints[3].position.set(0, 2.6, 2.9)
}

// Animation loop
function render() {
    //requestAnimationFrame(render);


    // Render the scene with the camera
    renderer.render(scene, camera);
}

let i = 0;
// Start the animation loop
moveToHomeButton.addEventListener('click', () => {
    i++;
    joints[3].position.set(0, 3, i*0.1);
    console.log("Pozycja", i*0.1)
    render();
});

moveForward.addEventListener('click', () => {
    i++;
    joints[1].rotation.set(0, i*0.1, 0);
    joints[2].rotation.set(0, i*0.1, 0);
    joints[3].rotation.set(0, i*0.1, 0);
    render();
});

setupAxes();
render();