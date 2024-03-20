/* JUST TO BE CLEAR - ITS PROTOTYPE, NOT FINAL VERSION */

export default class RoboFlow {
    constructor(arm) {
        this.arm = arm;
    }

    delay = (delay) => {
        return new Promise(resolve => setTimeout(resolve, delay*1000));
    }

    async run(compiled) {
        const instructions = JSON.parse(compiled);
        for(let i = 0; i < instructions.length; i++) {
            const instruction = instructions[i].instruction;
            const values = instructions[i].values;
            switch(instruction) {
                case "MOVE":
                    console.log("MOVE");
                    const [j1, j2, rj1, rj2, height] = this.arm.inverseKinematics(
                        values.x,
                        values.z,
                        values.y,
                    );
                    this.arm.transition(j1, j2, height);
                    this.arm.port.write(`LINEAR ${rj1}:${rj2}\n`);
                    this.arm.port.write(`Z ${height}\n`);
                    break;

                case "WAIT":
                    console.log("WAIT");
                    await this.delay(values);
                    break;

                case "HOME":
                    console.log("HOME");
                    this.arm.port.write(`HOME${values}\n`);
                    break;
                case "GRIPPER":
                    console.log("GRP");
                    let action = (values === "CLOSE") ? "1" : "0";
                    this.arm.port.write(`GRP ${action}`);
                    break;
                case "ROTGRIP":
                    console.log("ROTGRIP");
                    this.arm.port.write(`W ${values.rotation}`);
                    break;
                default:
                    continue;
            }
        }
    }

    static parseScript(script) {
        // parser will return json with instructions and values for each instruction in case of successful compilation
        let compiled = [];

        const lines = script.split('\n');

        for(let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (
                line === '' || 
                line.startsWith('#')
            ) continue;
                
            
            if(line.startsWith('MOVE')) {
                const parts = line.split(' ');
                if(parts.length !== 4) {
                    alert(`Błąd w linii ${i + 1}`);
                    return false;
                }

                let x = parts[1];
                let y = parts[2];
                let z = parts[3];

                if(isNaN(x) || isNaN(y) || isNaN(z)) {
                    alert(`Błąd w linii ${i + 1}`);
                    return false;
                }
                
                compiled.push({
                    instruction: "MOVE",
                    values: { x, y, z } 
                });

                continue;
            }

            if(line.startsWith('WAIT')) {
                const parts = line.split(' ');
                if(parts.length !== 2) {
                    alert(`Błąd w linii ${i + 1}`);
                    return false;
                }

                let time = parts[1];

                if(isNaN(time)) {
                    alert(`Błąd w linii ${i + 1}`);
                    return false;
                }
                
                compiled.push({
                    instruction: "WAIT",
                    values: time 
                });

                continue;
            }

            if(line.startsWith('HOME')) {
                const parts = line.split(' ');
                if(parts.length !== 2) {
                    alert(`Błąd w linii ${i + 1}`);
                    return false;
                }

                let axis = parts[1];

                if(
                    axis !== 'J1' && 
                    axis !== 'J2' && 
                    axis !== 'Z' && 
                    axis !== 'W' && 
                    axis !== 'ALL'
                ) {
                    alert(`Błąd w linii ${i + 1}`);
                    return false;
                }

                compiled.push({
                    instruction: "HOME",
                    values: axis
                });

                continue;
            }

            if(line.startsWith('GRIPPER')) {
                const parts = line.split(' ');
                if(parts.length !== 2) {
                    alert(`Błąd w linii ${i + 1}`);
                    return false;
                }

                let action = parts[1];

                if(action !== 'OPEN' && action !== 'CLOSE') {
                    alert(`Błąd w linii ${i + 1}`);
                    return false;
                }

                compiled.push({
                    instruction: "GRIPPER",
                    values: action
                });

                continue;
            }

            if(line.startsWith("ROTGRIP")) {
                const parts = line.split(' ');
                if(parts.length !== 2) {
                    alert(`Błąd w linii ${i + 1}`);
                    return false;
                }

                let angle = parts[1];

                if(isNaN(angle)) {
                    alert(`Błąd w linii ${i + 1}`);
                    return false;
                }

                compiled.push({
                    instruction: "ROTGRIP",
                    values: { 
                        rotation: angle
                    }
                });

                continue;
            }
        }

        return JSON.stringify(compiled);
    }
}