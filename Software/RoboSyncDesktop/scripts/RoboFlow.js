/* JUST TO BE CLEAR - ITS PROTOTYPE, NOT FINAL VERSION */

export default class RoboFlow {
    constructor(arm, script) {
        this.arm = arm;
        this.script = script;
    }

    run() {
        const lines = this.script.split('\n');

        for(let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') continue;
            
            if(line.startsWith('MOVE')) {
                const parts = line.split(' ');

                let x = parts[1];
                let y = parts[2];
                let z = parts[3];

                if(isNaN(x) || isNaN(y) || isNaN(z)) {
                    alert(`Błąd w linii ${i + 1}`);
                    return false;
                }

                const [j1, j2, rj1, rj2, height] = this.arm.inverseKinematics(x, y, z);
                this.arm.transition(j1, j2, height);

                continue;
            }

            if(line.startsWith('WAIT')) {
                const parts = line.split(' ');
                if(parts.length !== 2) {
                    alert(`Błąd w linii ${i + 1}`);
                    return false;
                }

                let time = parts[1];
                
                setTimeout(() => {
                    console.log("CZEKAM " + time + "s");
                    return;
                }, time*1000);

                console.log("ODCZEKANO");
                continue;
            }

            if(line.startsWith('HOME')) {
                const parts = line.split(' ');
                if(parts.length !== 2) {
                    alert(`Błąd w linii ${i + 1}`);
                    return false;
                }

                let axis = parts[1];

                if(axis !== 'J1' && axis !== 'J2' && axis !== 'Z') {
                    alert(`Błąd w linii ${i + 1}`);
                    return false;
                }

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

                continue;
            }
        }
    }

    static parseScript(script) {
        const lines = script.split('\n');

        for(let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') continue;
            
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
                
                continue;
            }

            if(line.startsWith('HOME')) {
                const parts = line.split(' ');
                if(parts.length !== 2) {
                    alert(`Błąd w linii ${i + 1}`);
                    return false;
                }

                let axis = parts[1];

                if(axis !== 'J1' && axis !== 'J2' && axis !== 'Z') {
                    alert(`Błąd w linii ${i + 1}`);
                    return false;
                }

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

                continue;
            }
        }

        return true;
    }
}