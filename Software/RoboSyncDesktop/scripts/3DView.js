import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class Arm {
    constructor(scene, render) {
        this.joints = {
            Z: {
                model: null,
                offsets: { x: 0, y: 0.8, z: 0 },
                angle: 0,
                height: 0,
            },
            J1: {
                model: null,
                offsets: { x: 0, y: 1.1, z: 0 },
                angle: 0,
            },
            J2: {
                model: null,
                offsets: { x: 0, y: 0.7, z: 2.9 },
                angle: 0,
            },
            gripper: {
                model: null,
                offsets: { x: 0, y: 0.7, z: 3.4 },
                angle: 0,
            },
        };

        this.filenames = [
            "base-axis",
            "Z-axis",
            "J1-axis",
            "J2-axis",
        ];
        
        this.Zangle = 0;
        
        this.J1angle = 0;
        this.J2angle = 0;

        this.render = render;
        this.loader = new OBJLoader();
        this.scene = scene;
        this.setupAxes();
    }

    loadModel(filename) {
        return new Promise((resolve, reject) => {
            this.loader.load(`../models/${filename}.obj`, function(object) {
                object.scale.set(0.01, 0.01, 0.01);
                resolve(object);
            }, undefined, function(error) {
                reject(error);
            });
        });
    }

    async setupAxes() {
        let joints = [];
        for(let i = 0; i < this.filenames.length; i++) {
            try {
                const object = await this.loadModel(this.filenames[i]);
                scene.add(object);
                joints.push(object);
            } catch (error) {
                console.error(`Error loading model ${this.filenames[i]}:`, error);
            }
        }
        
        this.joints.Z.model = joints[1]; // Z axis
        this.joints.J1.model = joints[2]; // J1 axis
        this.joints.J2.model = joints[3]; // J2 axis

        // Gripper
        //this.joints.gripper = joints[4].position.set(0, 2.6, 5.3);

        this.joints.Z.model.position.set(
            this.joints.Z.offsets.x, 
            this.joints.Z.offsets.y, 
            this.joints.Z.offsets.z
        );

        this.joints.J1.model.position.set(
            this.joints.J1.offsets.x, 
            this.joints.J1.offsets.y, 
            this.joints.J1.offsets.z
        );

        this.joints.J2.model.position.set(
            this.joints.J2.offsets.x, 
            this.joints.J2.offsets.y, 
            this.joints.J2.offsets.z
        );

        this.render();
    }

    setJ1Angle(angle) {
        this.Zangle = angle
        this.J1angle = angle;
    
        this.joints.Z.model.rotation.set(0, this.Zangle, 0);
        this.joints.J1.model.rotation.set(0, this.J1angle, 0);
    
        // Position correction for joint J2
        let x = Math.sin(this.J1angle) * 2.9;
        let z = Math.cos(this.J1angle) * 2.9;
        
        this.joints.J2.model.rotation.set(0, (this.J1angle + this.J2angle), 0);
        
        // TODO: extract constant to a variable
        this.joints.J2.model.position.set(x, 2.6, z);

        this.render();
    }

    setJ2Angle(angle) {
        this.J2angle = angle;
        this.joints.J2.model.rotation.set(0, (this.J1angle + this.J2angle), 0);
        this.render();
    }
}

// Create a scene
const scene = new THREE.Scene();

// Get canvas
const canvas = document.getElementById('3DView');
const width = canvas.clientWidth;
const height = canvas.clientHeight;

// Get controls
const moveToHome = document.getElementById('moveToHomeButton');
const moveForward = document.getElementById('af');
const moveBackward = document.getElementById('ab');
const moveUp = document.getElementById('au');
const moveDown = document.getElementById('ad');

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


// Create a red sphere
let geometry = new THREE.SphereGeometry( 0.1, 32, 32 );
let material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
let sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

// controls
let cameraControls = new OrbitControls( camera, renderer.domElement );
cameraControls.addEventListener( 'change', render );

// Render function
function render() {
    renderer.render(scene, camera);
}

const arm = new Arm(scene, render);


let j1 = 0;
let j2 = 0
let step = 0.3;

// Start the animation loop
moveForward.addEventListener('click', () => {
    j2++;
    arm.setJ2Angle(j2*step);
    console.log("J1: " + j1*step + " J2: " + j2*step);
});

moveBackward.addEventListener('click', () => {
    j1++;
    arm.setJ1Angle(j1*step);
    console.log("J1: " + j1*step + " J2: " + j2*step);
});

moveToHome.addEventListener('click', () => {
    console.log(arm.J1angle, arm.J2angle);
});


/*
moveToHome.addEventListener('click', () => {
    i++;

    J1angle = i*step;
    
    joints[1].rotation.set(0, J1angle, 0);
    joints[2].rotation.set(0, J1angle, 0);

    let x = Math.sin(J1angle) * 2.9;
    let z = Math.cos(J1angle) * 2.9;
    joints[3].rotation.set(0, (J1angle + J2angle), 0);
    joints[3].position.set(x, 2.6, z);
    console.log()
    render();
});

/*
moveBackward.addEventListener('click', () => {
    i--;

    J1angle = i*step;

    joints[1].rotation.set(0, J1angle, 0);
    joints[2].rotation.set(0, J1angle, 0);

    let x = Math.sin(J1angle) * 2.9;
    let z = Math.cos(J1angle) * 2.9;
    joints[3].rotation.set(0, (J1angle + J2angle), 0);
    joints[3].position.set(x, 2.6, z);
    console.log()
    render();
});

moveUp.addEventListener('click', () => {
    d++;
    J2angle = d*step;
    joints[3].rotation.set(0, (J1angle + J2angle), 0);
    render();
});

moveDown.addEventListener('click', () => {
    d--;
    J2angle = d*step;
    joints[3].rotation.set(0, (J1angle + J2angle), 0);
    render();
});

// J1 length = 3
// J2 length = 2.4

let sx = 0, sy = 0, sz = 0;
window.addEventListener('keydown', (event) => {
    if(event.key === "w") {
        sx += 0.1;
    }
    else if(event.key === "a") {
        sy += 0.1;
    }
    else if(event.key === "s") {
        sx -= 0.1;
    }
    else if(event.key === "d") {
        sy -= 0.1;
    }
    else if(event.key === "q") {
        sz -= 0.1;
    }
    else if(event.key === "e") {
        sz += 0.1;
    }

    if(event.key === "Enter") {
        sphere.position.set(sx, sz, sy);
        let [ baseAngle, armAngle, z] = inverseKinematics(sx, sy, sz);
        console.log(baseAngle, armAngle, z);
        joints[1].rotation.set(0, baseAngle, 0);
        joints[2].rotation.set(0, baseAngle, 0);
        joints[3].rotation.set(0, (baseAngle + armAngle), 0);
    }

    console.log(sx, sy, sz);
    sphere.position.set(sx, sz, sy);
    render();
});

function inverseKinematics(x, y, z) {
    // Zadane współrzędne
    // sx, sz, sy

    // Długości ramion
    let j1 = 3;
    let j2 = 2.4;

    // Odległość od podstawy
    let r =  x**2 + y**2;

    console.log("R", r);

    // Kąt pomiędzy ramionami
    let gamma = Math.acos((r  - x**2 - y**2) / (-2*x*y) );
    let baseAngle = Math.acos((x**2 - r - y**2) / (-2*Math.sqrt(r)*y) );

    console.log("Gamma", gamma);

    return [baseAngle, gamma, z];
}
*/
