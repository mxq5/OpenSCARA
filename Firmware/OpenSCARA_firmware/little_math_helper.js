const readline = require('readline');

const AXIS_Z_MAX_VALUE = 370;

let Z = 370;
let currentStepsPosition = 0;

// Funkcja do obliczania Z
function calculateZ(value) {
    if (Z == -1) {
        console.log("ERR! Z is not homed yet");
        return; 
    }

    if (value < 0) {
        console.log("Invaild argument")
        return;
    }

    if (value > (AXIS_Z_MAX_VALUE)) {
        console.log("OUT OF RANGE");
        return;
    }

    let steps = (currentStepsPosition + ((Z - value) * 2 * 200 * 8)); //2 * 200 * 8
    currentStepsPosition = steps;
    console.log(steps);
    Z = value;
}

// Utworzenie interfejsu readline do czytania z konsoli
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Funkcja do pytania użytkownika i obliczania
function askAndCalculate() {
    rl.question('Podaj wartość do przeliczenia Z: ', (input) => {
        const value = parseFloat(input);
        if (!isNaN(value)) {
            calculateZ(value);
        } else {
            console.log('To nie jest prawidłowa liczba, spróbuj ponownie.');
        }
        askAndCalculate(); // Pyta ponownie, tworząc pętlę
    });
}

// Rozpoczęcie pętli
askAndCalculate();
