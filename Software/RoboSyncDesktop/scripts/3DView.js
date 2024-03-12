import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class Arm {
    constructor(scene, render) {
        this.joints = {
            Z: {
                model: null,
                offsets: { x: 0, y: 0.8, z: 0 },
                height: 0,
            },
            J1: {
                model: null,
                offsets: { x: 0, y: 1.1, z: 0 },
                angle: 0,
                armlength: 2.9
            },
            J2: {
                model: null,
                offsets: { x: 0, y: 0.7, z: 2.9 },
                angle: 0,
            },
            gripper: {
                model: null,
                offsets: { x: 0, y: 0.7, z: 6 },
                angle: 0,
            },
        };

        this.filenames = [
            "base-axis",
            "Z-axis",
            "J1-axis",
            "J2-axis",
        ];

        this.render = render;
        this.loader = new OBJLoader();
        this.scene = scene;
        this.setupAxes();

        this.IKIndicator = { 
            x: this.joints.gripper.offsets.x - 2, 
            y: 0 + 2, 
            z: this.joints.gripper.offsets.z - 3
        };
        this.IKindicatorModel = this.spawnIKIndicator();
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
        this.joints.J1.angle = angle;
    
        this.joints.Z.model.rotation.set(0, this.joints.J1.angle, 0);
        this.joints.J1.model.rotation.set(0, this.joints.J1.angle, 0);
    
        // Position correction for joint J2
        this.joints.J2.offsets.x = Math.sin(this.joints.J1.angle) * this.joints.J1.armlength;
        this.joints.J2.offsets.z = Math.cos(this.joints.J1.angle) * this.joints.J1.armlength;

        this.joints.J2.model.rotation.set(0, (this.joints.J1.angle + this.joints.J2.angle), 0);
        this.joints.J2.model.position.set(
            this.joints.J2.offsets.x,
            (this.joints.J2.offsets.y + this.joints.Z.height), 
            this.joints.J2.offsets.z
            );

        this.render();
    }

    setJ2Angle(angle) {
        this.joints.J2.angle = angle;
        this.joints.J2.model.rotation.set(0, (this.joints.J1.angle + this.joints.J2.angle), 0);
        this.render();
    }

    setHeight(height) {
        this.joints.Z.height = height;
        this.joints.J1.model.position.set(
            this.joints.J1.offsets.x, 
            (this.joints.J1.offsets.y + this.joints.Z.height), 
            this.joints.J1.offsets.z
        );

        this.joints.J2.model.position.set(
            this.joints.J2.offsets.x, 
            (this.joints.J2.offsets.y + this.joints.Z.height), 
            this.joints.J2.offsets.z
        );

        this.render();
    }

    spawnIKIndicator() {
        const geometry = new THREE.SphereGeometry( 0.1, 32, 32 );
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const indicatorModel = new THREE.Mesh( geometry, material );
        
        this.scene.add(indicatorModel);
        indicatorModel.position.set(this.IKIndicator.x, this.IKIndicator.y, this.IKIndicator.z);

        return indicatorModel;
    }

    setIKIndicatorPosition(x, y, z) {
        this.IKindicatorModel.position.set(x, y, z);
        this.render();
    }

    getIKIndicatorPosition() {
        return this.IKIndicator;
    }

    dtr = (rad) => { return (rad * (Math.PI/180)); }
    rtd = (rad) => { return (rad * (180/Math.PI)); }

    inverseKinematics(z, y, x) {
        let a = 2.85;      // J1 arm length
        let b = 2.45;    
        let heightOffset = -0.2;
        let height = y;

        const c = Math.sqrt(Math.pow(x, 2) + Math.pow(z, 2));

        let gamma = Math.acos(( (c**2 - a**2 - b**2) / (-2 * a * b) ));
        let beta = Math.acos((( b**2 - a**2 - c**2 ) / ( -2 * a * c)));

        // Do tąd jest ok

        let alpha = (Math.asin(z/c) - beta);

        gamma = Math.PI - gamma;

        if(x < 0) {
            alpha = Math.PI - alpha;
            gamma = Math.PI * 2 - gamma;
        }

        return [alpha, gamma, height + heightOffset];
    }


    transition(j1, j2, height) {
        // Przykładowe pozycje parametrów - mogą to być na przykład czasy próbek.
        // Dla uproszczenia używamy [0, 1], co oznacza, że mamy dwie próbki: jedną na początku (czas = 0) i jedną na końcu (czas = 1).
        const parameterPositions = new Float32Array([0, 1]);

        // Przykładowe wartości próbek. Tutaj mamy dwie próbki w przestrzeni 3D, więc potrzebujemy 6 wartości (2 próbki * 3 wartości na próbkę).
        const sampleValues = new Float32Array(
            [
                this.joints.J1.angle, this.joints.J2.angle, this.joints.Z.height, 
                j1, j2, height
            ]
        ); // Z pierwszego punktu [0, 0, 0] do drugiego [10, 10, 10].


        // Rozmiar próbki. Dla 3D jest to 3, ponieważ mamy do czynienia z trójwymiarowymi punktami (x, y, z).
        const sampleSize = 3;

        // Bufor wynikowy, gdzie zostanie zapisany wynik interpolacji.
        const resultBuffer = new Float32Array(sampleSize);

        // Tworzenie interpolanta.
        const interpolant = new THREE.LinearInterpolant( parameterPositions, sampleValues, sampleSize, resultBuffer );

        // Wykonanie interpolacji. Używamy 0.5, aby uzyskać wartość środkową między naszymi dwoma punktami próbkami.
        interpolant.evaluate(0.5);

        console.log(resultBuffer);
        
        // Liczba punktów do interpolacji (więcej punktów = gładsza ścieżka)
        const steps = 10;
        const interpolatedValues = [];

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            interpolant.evaluate(t);
            interpolatedValues.push([...resultBuffer]);
        }

        for (let i = 0; i < interpolatedValues.length; i++) {
            setTimeout(() => {
                let [j1, j2, height] = interpolatedValues[i];
                this.setJ1Angle(j1);
                this.setJ2Angle(j2);
                this.setHeight(height);
                
                this.render();
            }, 10 * i);
        }
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
const camera = new THREE.PerspectiveCamera(90, width / height, 0.1, 1000);

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

// Render function
function render() { renderer.render(scene, camera); }

const arm = new Arm(scene, render);

// Controls
moveForward.addEventListener('click', () => {
    arm.joints.J2.angle += 0.1;
    arm.setJ2Angle(arm.joints.J2.angle);
});

moveBackward.addEventListener('click', () => {
    arm.joints.J2.angle -= 0.1;
    arm.setJ2Angle(arm.joints.J2.angle);
});

moveUp.addEventListener('click', () => {
    arm.joints.J1.angle += 0.1;
    arm.setJ1Angle(arm.joints.J1.angle);
});

moveDown.addEventListener('click', () => {
    arm.joints.J1.angle -= 0.1;
    arm.setJ1Angle(arm.joints.J1.angle);
});

moveToHome.addEventListener('click', () => {
    arm.transition(0, 0, 0);
});


window.addEventListener('keydown', (event) => {
    if(event.key === "q") {
        arm.joints.Z.height -= 0.1;
        arm.setHeight(arm.joints.Z.height);
    }
    else if(event.key === "e") {
        arm.joints.Z.height += 0.1;
        arm.setHeight(arm.joints.Z.height);
    }

    if(event.key === "w") {
        arm.IKIndicator.z -= 0.1;
        arm.setIKIndicatorPosition(arm.IKIndicator.x, arm.IKIndicator.y, arm.IKIndicator.z);
        console.log(arm.IKIndicator);
    } else if(event.key === "s") {
        arm.IKIndicator.z += 0.1;
        arm.setIKIndicatorPosition(arm.IKIndicator.x, arm.IKIndicator.y, arm.IKIndicator.z);
    } else if(event.key === "a") {
        arm.IKIndicator.x -= 0.1;
        arm.setIKIndicatorPosition(arm.IKIndicator.x, arm.IKIndicator.y, arm.IKIndicator.z);
    } else if(event.key === "d") {
        arm.IKIndicator.x += 0.1;
        arm.setIKIndicatorPosition(arm.IKIndicator.x, arm.IKIndicator.y, arm.IKIndicator.z);
    } else if (event.key === "c") {
        arm.IKIndicator.y += 0.1;
        arm.setIKIndicatorPosition(arm.IKIndicator.x, arm.IKIndicator.y, arm.IKIndicator.z);
    } else if (event.key === "z") {
        arm.IKIndicator.y -= 0.1;
        arm.setIKIndicatorPosition(arm.IKIndicator.x, arm.IKIndicator.y, arm.IKIndicator.z);
    }

    if (event.key === "g") {
        console.log(arm.IKIndicator);
    }
    
    if (event.key === "i") {
        const [j1, j2, height] = arm.inverseKinematics(arm.IKIndicator.x, arm.IKIndicator.y, arm.IKIndicator.z);
        arm.transition(j1, j2, height);
    } 
});