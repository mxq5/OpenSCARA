#include <Arduino.h>
#include <pinmap.h>
#include <string.h>

class OpenSCARA {
  public:
    // Available screws: t8x8, t8x2
    uint8_t Z_screwPitch = 2;

    // Reduction ratio
    float J1_gear_ratio = 9;
    float J2_gear_ratio = 6.857136; //6.857; 
    float W_gear_ratio = 4;

    int Zmax = 370;       // mm
    int ZHeight = 95;     // mm
    int J1max = 270;   // deg
    int J2max = 270;   // deg
    int Wmax = 270;    // deg

    float J1_EndstopOffset = 0; //deg
    float J2_EndstopOffset = 0; //deg
    float W_EndstopOffset = 0; //deg

    float X = -1;
    float Y = -1;
    
    float Z = -1;
    float W = -1;
    float J1 = -1;
    float J2 = -1;

    // Move single axis by steps
    void moveSteps(uint8_t axis, unsigned long steps, int delay = 300) {
      for(unsigned long i = 0; i < steps; i++) {
        digitalWrite(axis, HIGH);
        delayMicroseconds(delay);
        digitalWrite(axis, LOW);
        delayMicroseconds(delay);
      }
    }
    
    void homeZ() {
      digitalWrite(Z_DIR_PIN, LOW);
      while(digitalRead(Z_MIN_PIN) == HIGH) {
        // Move Z Up
        moveSteps(Z_STEP_PIN, 20, 50);
      }
      delay(500);
      digitalWrite(Z_DIR_PIN, HIGH);
      
      // Length of axis - Height of axis / pitch of screw * 200 steps per revolution * 8 microsteps 
      uint8_t offset = 100;
      unsigned long steps = static_cast<unsigned long>((Zmax - ZHeight - offset) /  Z_screwPitch) * 200 * 8;

      moveSteps(Z_STEP_PIN, steps, 50);
      Z = offset;
    }

    void homeJ1() {
      // Move J1 to the left
      digitalWrite(J1_DIR_PIN, HIGH);
      while(digitalRead(J1_MIN_PIN) == HIGH) {
        moveSteps(J1_STEP_PIN, 20, 600);
      }
      digitalWrite(J1_DIR_PIN, LOW);

      J1 = 0;
    }

    void homeJ2() {
      // Move J2 to the left
      digitalWrite(J2_DIR_PIN, HIGH);
      while(digitalRead(J2_MIN_PIN) == HIGH) {
        moveSteps(J2_STEP_PIN, 20, 700);
      }
      digitalWrite(J2_DIR_PIN, LOW);

      J2 = 0;
    }

    void homeW() {
      digitalWrite(W_DIR_PIN, HIGH);
      while(digitalRead(W_MIN_PIN) == HIGH) {
        moveSteps(W_STEP_PIN, 300);
      }
      digitalWrite(W_DIR_PIN, LOW);

      W = 0;
    }

    void homeAll() {
      homeZ();
      homeJ1();
      homeJ2();
      homeW();
      Serial.println("_DONE");
    }

    int calculateAngle(float gearRatio, float endstopOffset, float value, float currentPos) {
      int steps = round( (gearRatio * (200 * 8)) * abs(currentPos - (value - endstopOffset)) / 360 );
      return steps;
    }

    void setZ(int value) {
      if (Z == -1) {
        Serial.println("ERR! Z is not homed yet");
        return; 
      }

      if (Z == value || value < 0) return;

      if (value > (Zmax - ZHeight)) {
        Serial.println("ERR! Z is out of range");
        return;
      }

      if (value < Z) {
        digitalWrite(Z_DIR_PIN, HIGH);
      } else {
        digitalWrite(Z_DIR_PIN, LOW);
      }

      unsigned long steps = static_cast<unsigned long>((abs(Z - value)) /  Z_screwPitch) * 200 * 8;
      moveSteps(Z_STEP_PIN, steps, 50);
      Z = value;
      Serial.println("_DONE");
    }

    void AngleJ1(float angle) {
      if (J1 == -1) {
        Serial.println("ERR! J1 is not homed yet");
        return; 
      }

      if (J1 == angle || angle < 0) return;

      if (angle > (J1max - J1_EndstopOffset)) {
        Serial.println("ERR! Value is out of range");
        return;
      }

      if (angle < J1) {
        digitalWrite(J1_DIR_PIN, HIGH);
      } else {
        digitalWrite(J1_DIR_PIN, LOW);
      }

      int steps = calculateAngle(J1_gear_ratio, J1_EndstopOffset, angle, J1);
      moveSteps(J1_STEP_PIN, steps, 600);
      J1 = angle;
      Serial.println("_DONE");
    }

    void AngleJ2(float angle) {
      if (J2 == -1) {
        Serial.println("ERR! J2 is not homed yet");
        return; 
      }

      if (J2 == angle || angle < 0) return;

      if (angle > (J2max - J2_EndstopOffset)) {
        Serial.println("ERR! Value is out of range");
        return;
      }

      if (angle < J2) {
        digitalWrite(J2_DIR_PIN, HIGH);
      } else {
        digitalWrite(J2_DIR_PIN, LOW);
      }

      int steps = calculateAngle(J2_gear_ratio, J2_EndstopOffset, angle, J2);
      moveSteps(J2_STEP_PIN, steps, 600);
      J2 = angle;
      Serial.println("_DONE");
    }

    void AngleW(float angle) {
      if (W == -1) {
        Serial.println("ERR! W is not homed yet");
        return; 
      }

      if (W == angle || angle < 0) return;

      if (angle > (Wmax - W_EndstopOffset)) {
        Serial.println("ERR! Value is out of range");
        return;
      }

      if (angle < W) {
        digitalWrite(W_DIR_PIN, HIGH);
      } else {
        digitalWrite(W_DIR_PIN, LOW);
      }

      int steps = calculateAngle(W_gear_ratio, W_EndstopOffset, angle, W);
      moveSteps(W_STEP_PIN, steps, 400);
      W = angle;
      Serial.println("_DONE");
    }

    void printStatus() {
      Serial.println("X: " + String(X) + " Y: " + String(Y) + " Z: " + String(Z));
      Serial.println("J1: " + String(J1) + " J2: " + String(J2) + " W: " + String(W));
    }

    void linearMove(String value) {
      uint8_t colon = value.indexOf(":");
      String J1_string = value.substring(0, colon);
      String J2_string = value.substring(colon + 1);

      //AngleJ1(J1_string.toFloat());
      //AngleJ2(J2_string.toFloat());
      //return;

      float J1_target_angle = J1_string.toFloat();
      float J2_target_angle = J2_string.toFloat();

      int J1_steps = calculateAngle(J1_gear_ratio, J1_EndstopOffset, J1_target_angle, J1);
      int J2_steps = calculateAngle(J2_gear_ratio, J2_EndstopOffset, J2_target_angle, J2);

      if (J1 == -1) {
        Serial.println("ERR! J1 is not homed yet");
        return; 
      }

      if (J1 == J1_target_angle || J1_target_angle < 0) return;

      if (J1_target_angle > (J1max - J1_EndstopOffset)) {
        Serial.println("ERR! Value is out of range");
        return;
      }

      if (J2 == -1) {
        Serial.println("ERR! J2 is not homed yet");
        return; 
      }

      if (J2 == J2_target_angle || J2_target_angle < 0) return;

      if (J2_target_angle > (J2max - J2_EndstopOffset)) {
        Serial.println("ERR! Value is out of range");
        return;
      }
      

      if (J2_target_angle < J2) {
        digitalWrite(J2_DIR_PIN, HIGH);
      } else {
        digitalWrite(J2_DIR_PIN, LOW);
      }

      if (J1_target_angle < J1) {
        digitalWrite(J1_DIR_PIN, HIGH);
      } else {
        digitalWrite(J1_DIR_PIN, LOW);
      }
      
      // Oblicz największą liczbę kroków
      int max_steps = max(J1_steps, J2_steps);

      // Oblicz proporcje kroków dla każdego silnika
      float J1_step_rate = J1_steps / (float)max_steps;
      float J2_step_rate = J2_steps / (float)max_steps;

      float J1_accumulator = 0;
      float J2_accumulator = 0;

      int delay = 800;

      for (int i = 0; i < max_steps; i++) {
          J1_accumulator += J1_step_rate;
          J2_accumulator += J2_step_rate;

          if (J1_accumulator >= 1) {
              digitalWrite(J1_STEP_PIN, HIGH); // Zrób krok silnikiem J1
              delayMicroseconds(delay);
              digitalWrite(J1_STEP_PIN, LOW);
              delayMicroseconds(delay);
              J1_accumulator -= 1; // Resetuj akumulator
          }

          if (J2_accumulator >= 1) {
              digitalWrite(J2_STEP_PIN, HIGH); // Zrób krok silnikiem J2
              delayMicroseconds(delay);
              digitalWrite(J2_STEP_PIN, LOW);
              delayMicroseconds(delay);
              J2_accumulator -= 1; // Resetuj akumulator
          }
      }

      J1 = J1_target_angle;
      J2 = J2_target_angle;
      Serial.println("_DONE");
    }

    void gripper(int value) {
      if(value == 0) {
        digitalWrite(RELAY_1_PIN, LOW);
        digitalWrite(RELAY_2_PIN, LOW);
      } else if (value == 1) {
        digitalWrite(RELAY_1_PIN, HIGH);
        digitalWrite(RELAY_2_PIN, HIGH);
      }
      Serial.println("_DONE");
    }

    void tape(int value) {
      if (value < 0) {
        digitalWrite(TAPE_DIR_PIN, HIGH);
      } else {
        digitalWrite(TAPE_DIR_PIN, LOW);
      }

      unsigned long steps = abs(value);
      moveSteps(TAPE_STEP_PIN, steps, 200);
      Serial.println("_DONE");
    }

  OpenSCARA() {
    // do some stuff
  }
};

OpenSCARA scara;

void setup() {
  // gripper relays 
  pinMode(RELAY_1_PIN, OUTPUT);
  pinMode(RELAY_2_PIN, OUTPUT);
  digitalWrite(RELAY_1_PIN, LOW);
  digitalWrite(RELAY_2_PIN, LOW);
  
  // TAPE
  pinMode(TAPE_STEP_PIN, OUTPUT);
  pinMode(TAPE_DIR_PIN, OUTPUT);
  pinMode(TAPE_ENABLE_PIN, OUTPUT);
  digitalWrite(TAPE_ENABLE_PIN, LOW); // Enable Axis

  // J1
  pinMode(J1_STEP_PIN, OUTPUT);
  pinMode(J1_DIR_PIN, OUTPUT);
  pinMode(J1_ENABLE_PIN, OUTPUT);
  digitalWrite(J1_ENABLE_PIN, LOW); // Enable Axis
  
  // J2
  pinMode(J2_STEP_PIN, OUTPUT);
  pinMode(J2_DIR_PIN, OUTPUT);
  pinMode(J2_ENABLE_PIN, OUTPUT);
  digitalWrite(J2_ENABLE_PIN, LOW); // Enable Axis

  // Z
  pinMode(Z_STEP_PIN, OUTPUT);
  pinMode(Z_DIR_PIN, OUTPUT);
  pinMode(Z_ENABLE_PIN, OUTPUT);
  digitalWrite(Z_ENABLE_PIN, LOW); // Enable Axis

  // W
  pinMode(W_STEP_PIN, OUTPUT);
  pinMode(W_DIR_PIN, OUTPUT);
  pinMode(W_ENABLE_PIN, OUTPUT);

  // Enable Axis
  digitalWrite(W_ENABLE_PIN, LOW);

  // Endstops
  pinMode(J1_MIN_PIN, INPUT_PULLUP);
  pinMode(J2_MIN_PIN, INPUT_PULLUP);
  pinMode(Z_MIN_PIN, INPUT_PULLUP);
  pinMode(W_MIN_PIN, INPUT_PULLUP);

  Serial.begin(9600);

  while (!Serial) {
    ; // wait for serial port to connect.
  }
}

void parse(String buffer) {
  uint8_t space = buffer.indexOf(" ");
  
  // String builder
  String command = buffer.substring(0, space);
  String value = buffer.substring(space + 1);

  if (buffer.startsWith("HOMEALL")) {
    scara.homeAll();
  }
  else if (buffer.startsWith("HOMEZ")) {
    scara.homeZ();
    Serial.println("_DONE");
  }
  else if (buffer.startsWith("HOMEJ1")) {
    scara.homeJ1();
    Serial.println("_DONE");
  }
  else if (buffer.startsWith("HOMEJ2")) {
    scara.homeJ2();
    Serial.println("_DONE");
  }
  else if (buffer.startsWith("HOMEW")) {
    scara.homeW();
    Serial.println("_DONE");
  }
  else if (buffer.startsWith("Z")) {
    scara.setZ(value.toInt());
    Serial.println("_DONE");
  }
  else if (buffer.startsWith("J1")) {
    scara.AngleJ1(value.toFloat());
  }
  else if (buffer.startsWith("J2")) {
    scara.AngleJ2(value.toFloat());
  }
  else if (buffer.startsWith("W")) {
    scara.AngleW(value.toFloat());
  }
  else if (buffer.startsWith("GRP")) {
    scara.gripper(value.toInt());
  }
  else if (buffer.startsWith("STATUS")) {
    scara.printStatus();
  }
  else if (buffer.startsWith("LINEAR")) {
    scara.linearMove(value);
  }
  else if (buffer.startsWith("TP")) {
    scara.tape(value.toInt());
  }
  else {
    Serial.println("Unknown command");
  }
}

String buffer = "";
void loop () {
  if(Serial.available()) {
    char byte = Serial.read();
    Serial.print(byte);
    buffer += byte;
    if (byte == '\n' || byte == '\r') {
      Serial.println("Parsing: " + buffer);
      parse(buffer);
      buffer = "";
    }
  }
}