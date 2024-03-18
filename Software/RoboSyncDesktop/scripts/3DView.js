import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const { SerialPort } = require('serialport');

const portcom = 'COM5';

class Arm {
    constructor(scene, render) {
        this.realUnits = {};

        this.joints = {
            Z: {
                model: null,
                offsets: { x: 0, y: 80, z: 0 },
                height: 0,
                zPhisicalMaxHeight: (370 - 95), // 0 - 370 (95 is the height of the J1 axis)
            },
            J1: {
                model: null,
                offsets: { x: 0, y: 120, z: 0 },
                angle: 0,
                armlength: 298,
            },
            J2: {
                model: null,
                offsets: { x: 0, y: 75, z: 298 },
                angle: 0,
                armlength: 248,
            },
            gripper: {
                model: null,
                offsets: { x: 0, y: 75, z: 6 },
                angle: 0,
                gripperheight: 20,
                gripperPhisicalMaxAngle: 270, // 0 - 270
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
            x: 10, 
            y: 140, 
            z: 250
        };
        this.IKindicatorModel = this.spawnIKIndicator();

        this.port = new SerialPort({ path: portcom, baudRate: 9600 })
    }

    loadModel(filename) {
        return new Promise((resolve, reject) => {
            this.loader.load(`../models/${filename}.obj`, function(object) {
                //object.scale.set(0.01, 0.01, 0.01);
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

    setGripperAngle(angle) {
        if(angle < 0) angle = 0;
        this.joints.gripper.angle = angle % this.joints.gripper.gripperPhisicalMaxAngle;
        //this.joints.gripper.model.rotation.set(0, 0, this.joints.gripper.angle);
        display_wValue.innerText = angle;
        this.render();
    }

    spawnIKIndicator() {
        const geometry = new THREE.SphereGeometry( 5, 32, 32 );
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const indicatorModel = new THREE.Mesh( geometry, material );
        
        this.scene.add(indicatorModel);
        indicatorModel.position.set(this.IKIndicator.x, this.IKIndicator.y, this.IKIndicator.z);

        display_wValue.innerText = 0;
        display_xValue.innerText = this.IKIndicator.x;
        display_yValue.innerText = this.IKIndicator.y;
        display_zValue.innerText = this.IKIndicator.z;

        return indicatorModel;
    }

    setIKIndicatorPosition(x, y, z) {
        // TODO: extract interpolation to separate function
        const parameterPositions = new Float32Array([0, 1]);
        const sampleValues = new Float32Array(
        [
            this.IKIndicator.x, this.IKIndicator.y, this.IKIndicator.z,
            x, y, z
        ]);

        const sampleSize = 3;
        const resultBuffer = new Float32Array(sampleSize);

        const interpolant = new THREE.LinearInterpolant( parameterPositions, sampleValues, sampleSize, resultBuffer );
        interpolant.evaluate(0.5);
        
        const steps = 10;
        const interpolatedValues = [];

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            interpolant.evaluate(t);
            interpolatedValues.push([...resultBuffer]);
        }

        for (let i = 0; i < interpolatedValues.length; i++) {
            setTimeout(() => {
                let [nx, ny, nz] = interpolatedValues[i];
                this.IKindicatorModel.position.set(nx, ny, nz);
                this.render();
            }, 10 * i);
        }

        display_xValue.innerText = x;
        display_yValue.innerText = y;
        display_zValue.innerText = z;

        this.IKIndicator = { x, y, z };
    }

    getIKIndicatorPosition() {
        return this.IKIndicator;
    }

    dtr = (rad) => { return (rad * (Math.PI/180)); }
    rtd = (rad) => { return (rad * (180/Math.PI)); }

    inverseKinematics(z, y, x) {
        let a = this.joints.J1.armlength;      // J1 arm length
        let b = this.joints.J2.armlength;      // J2 arm length
        
        let heightOffset = -(this.joints.gripper.gripperheight);
        let height = y + heightOffset;

        const c = Math.sqrt(Math.pow(x, 2) + Math.pow(z, 2));

        let gamma = Math.acos(( (c**2 - a**2 - b**2) / (-2 * a * b) ));
        let beta = Math.acos((( b**2 - a**2 - c**2 ) / ( -2 * a * c)));

        let alpha = (Math.asin(z/c) - beta);

        gamma = Math.PI - gamma;

        if(x < 0) {
            alpha = Math.PI - alpha;
            gamma = Math.PI * 2 - gamma;
        }

        if( isNaN(alpha) || isNaN(gamma) || height < 0 || height > this.joints.Z.zPhisicalMaxHeight) {
            alert("Requested position is out of arm range!");
            return [this.joints.J1.angle, this.joints.J2.angle, this.joints.Z.height];
        }

        return [alpha, gamma, height];
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

// Create a camera
const camera = new THREE.PerspectiveCamera(90, width / height, 0.1, 4000);

camera.position.set( 750, 750, 600);
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

// Create a green line from 0, 0, 0 to 0, 65, 0  
/*
let material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
let points = [];
points.push(new THREE.Vector3(0, -1, 0));
points.push(new THREE.Vector3(0, -1, 65));
let geometry = new THREE.BufferGeometry().setFromPoints(points);
let line = new THREE.Line(geometry, material);
scene.add(line);
*/

// controls
let cameraControls = new OrbitControls( camera, renderer.domElement );
cameraControls.addEventListener( 'change', render );

// Render function
function render() { renderer.render(scene, camera); }



// Get controls
const btn_homeAllAxes = document.getElementById('moveToHomeButton');

const btn_x_home = document.getElementById('x_home');
const btn_x_plus = document.getElementById('x_plus');
const btn_x_minus = document.getElementById('x_minus');

const btn_y_home = document.getElementById('y_home');
const btn_y_plus = document.getElementById('y_plus');
const btn_y_minus = document.getElementById('y_minus');

const btn_z_home = document.getElementById('z_home');
const btn_z_plus = document.getElementById('z_plus');
const btn_z_minus = document.getElementById('z_minus');

const btn_w_home = document.getElementById('w_home');
const btn_w_plus = document.getElementById('w_plus');
const btn_w_minus = document.getElementById('w_minus');

const btn_forward = document.getElementById('forward');
const btn_enter = document.getElementById('enter');

const grp_left = document.getElementById('grp_left');
const grp_right = document.getElementById('grp_right');
const grp_up = document.getElementById('grp_up');
const grp_down = document.getElementById('grp_down');

const display_xValue = document.getElementById('xValue');
const display_yValue = document.getElementById('yValue');
const display_zValue = document.getElementById('zValue');
const display_wValue = document.getElementById('wValue');

const btn_gripper = document.getElementById('gripper');
let gripperState = false;

const arm = new Arm(scene, render);

// Controls
btn_x_minus.addEventListener('click', () => {
    arm.setIKIndicatorPosition(arm.IKIndicator.x - 10, arm.IKIndicator.y, arm.IKIndicator.z);
});

btn_x_home.addEventListener('click', () => {
    arm.port.write('HOMEJ1\n');
});

btn_x_plus.addEventListener('click', () => {
    arm.setIKIndicatorPosition(arm.IKIndicator.x + 10, arm.IKIndicator.y, arm.IKIndicator.z);
});

// Z to wysokość, ale three JS twierdzi inaczej
btn_y_minus.addEventListener('click', () => {
    arm.setIKIndicatorPosition(arm.IKIndicator.x, arm.IKIndicator.y, arm.IKIndicator.z - 10);
});

btn_y_home.addEventListener('click', () => {
    arm.port.write('HOMEJ2\n');
});

btn_y_plus.addEventListener('click', () => {
    arm.setIKIndicatorPosition(arm.IKIndicator.x, arm.IKIndicator.y, arm.IKIndicator.z + 10);
});

btn_z_plus.addEventListener('click', () => {
    arm.setIKIndicatorPosition(arm.IKIndicator.x, arm.IKIndicator.y + 10, arm.IKIndicator.z);
});

btn_z_home.addEventListener('click', () => {
    arm.port.write('HOMEZ\n');
});

btn_z_minus.addEventListener('click', () => {
    arm.setIKIndicatorPosition(arm.IKIndicator.x, arm.IKIndicator.y - 10, arm.IKIndicator.z);
});

btn_gripper.addEventListener('click', () => {
    gripperState = !gripperState;
    btn_gripper.style.color = gripperState ? 'red' : 'white';
    arm.port.write(`GRP ${gripperState ? '0' : '1'}\n`);
});

grp_down.addEventListener('click', () => {
    arm.setGripperAngle(arm.joints.gripper.angle - 10);
    if(arm.port?.isOpen) arm.port.write(`W ${arm.joints.gripper.angle}\n`);
});
grp_up.addEventListener('click', () => {
    arm.setGripperAngle(arm.joints.gripper.angle + 10);
    if(arm.port?.isOpen) arm.port.write(`W ${arm.joints.gripper.angle}\n`); 
});

grp_left.addEventListener('click', () => {
    arm.port.write('TP 900\n');
});

grp_right.addEventListener('click', () => {
    arm.port.write('TP -900\n');
});

btn_w_home.addEventListener('click', () => {
    arm.port.write('HOMEW\n');
});

let wState = 0;
btn_w_plus.addEventListener('click', () => {
    if(wState <= 260) {
        wState += 10;
        arm.port.write(`W ${wState}\n`);
    }
});

btn_w_minus.addEventListener('click', () => {
    if(wState >= 10) {
        wState -= 10;
        arm.port.write(`W ${wState}\n`);
    }
});

btn_forward.addEventListener('click', () => {
    const [j1, j2, height] = arm.inverseKinematics(arm.IKIndicator.x, arm.IKIndicator.y, arm.IKIndicator.z);
    arm.transition(j1, j2, height);
    
    const realj1 = (135 + arm.rtd(j1)).toFixed(0);
    const realj2 = (135 + arm.rtd(j2)).toFixed(0);

    const serial = `LINEAR ${realj1}:${realj2}\n`;

    console.log(serial);
    arm.port.write(serial);
    arm.port.write(`Z ${height}\n`);
});

btn_homeAllAxes.addEventListener('click', () => {
    arm.transition(0, 0, 0);
    arm.port.write('HOMEALL\n');
    console.log('arm homed');
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
        arm.setIKIndicatorPosition(arm.IKIndicator.x, arm.IKIndicator.y, arm.IKIndicator.z - 10);
    } else if(event.key === "s") {
        arm.setIKIndicatorPosition(arm.IKIndicator.x, arm.IKIndicator.y, arm.IKIndicator.z + 10);
    } else if(event.key === "a") {
        arm.setIKIndicatorPosition(arm.IKIndicator.x - 10, arm.IKIndicator.y, arm.IKIndicator.z);
    } else if(event.key === "d") {
        arm.setIKIndicatorPosition(arm.IKIndicator.x + 10, arm.IKIndicator.y, arm.IKIndicator.z);
    } else if (event.key === "c") {
        arm.setIKIndicatorPosition(arm.IKIndicator.x, arm.IKIndicator.y + 10, arm.IKIndicator.z);
    } else if (event.key === "z") {
        arm.setIKIndicatorPosition(arm.IKIndicator.x, arm.IKIndicator.y - 10, arm.IKIndicator.z);
    }
    
    if (event.key === "i") {
        const [j1, j2, height] = arm.inverseKinematics(arm.IKIndicator.x, arm.IKIndicator.y, arm.IKIndicator.z);
        console.log(arm.rtd(j1), arm.rtd(j2), height);
        arm.transition(j1, j2, height);
    } 
});