/* JUST TO BE CLEAR - ITS PROTOTYPE, NOT FINAL VERSION */

export default class RoboFlow {
    constructor(arm) {
        this.arm = arm;
    }

    delay = (delay) => {
        return new Promise(resolve => setTimeout(resolve, delay*1000));
    }

    async run(compiled, headless = false) {
        const instructions = JSON.parse(compiled);

        for(let i = 0; i < instructions.length; i++) {
            const instruction = instructions[i].instruction;
            const values = instructions[i].values;

            // Add delay in hedless mode for slower animation
            if(headless) await this.delay(1);

            switch(instruction) {
                case "MOVE":
                    console.log("MOVE", values);
                    const [j1, j2, rj1, rj2, height] = this.arm.inverseKinematics(
                        parseFloat(values.x),
                        parseFloat(values.y),
                        parseFloat(values.z),
                    );
                    
                    console.log(rj1, rj2);

                    if(!headless) {
                        await this.arm.executeUntilDone(`SIMULTANEOUS${rj1}:${rj2}`);
                        await this.arm.executeUntilDone(`Z ${height}`);
                    }

                    this.arm.transition(j1, j2, height);
                    break;

                case "WAIT":
                    console.log("WAIT");
                    await this.delay(values);
                    break;

                case "HOME":
                    console.log("HOME", values);
                    if(!headless) await this.arm.executeUntilDone(`HOME${values}`);
                    break;
                case "GRIPPER":
                    console.log("GRP", values);
                    let action = (values === "CLOSE") ? "1" : "0";
                    this.arm.setGripperState((values === "CLOSE") ? true : false);
                    if(!headless) await this.arm.executeUntilDone(`GRP ${action}`);
                    break;
                case "ROTGRIP":
                    console.log("ROTGRIP", values.rotation);
                    if(!headless) await this.arm.executeUntilDone(`W ${values.rotation}`);
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
                let y = parts[3];
                let z = parts[2];

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