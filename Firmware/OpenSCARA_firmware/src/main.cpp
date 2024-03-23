#include <Arduino.h>
#include <OpenSCARA/OpenSCARA.h>

// Motors    
AccelStepper AXIS_Z     (AccelStepper::DRIVER, Z_STEP_PIN, Z_DIR_PIN);
AccelStepper AXIS_J1    (AccelStepper::DRIVER, J1_STEP_PIN, J1_DIR_PIN);
AccelStepper AXIS_J2    (AccelStepper::DRIVER, J2_STEP_PIN, J2_DIR_PIN);
AccelStepper AXIS_W     (AccelStepper::DRIVER, W_STEP_PIN, W_DIR_PIN);
AccelStepper AXIS_TAPE  (AccelStepper::DRIVER, TAPE_STEP_PIN, TAPE_DIR_PIN);

OpenSCARA scara(AXIS_Z, AXIS_J1, AXIS_J2, AXIS_W, AXIS_TAPE);

void setup() {
    scara.pinConfiguration();

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
  }
  else if (buffer.startsWith("HOMEJ1")) {
    scara.homeJ1();
  }
  else if (buffer.startsWith("HOMEJ2")) {
    scara.homeJ2();
  }
  else if (buffer.startsWith("HOMEW")) {
    scara.homeW();
  }
  else if (buffer.startsWith("Z")) {
    scara.setZ(value.toInt());
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
  else if (buffer.startsWith("SPEED_MULTIPLIER")) {
    scara.speedMultiplier(value.toInt());
  }
  else if(buffer.startsWith("SETSPEED")) {
    scara.setSpeed(value);
  }
  else if(buffer.startsWith("SETACCEL")) {
    scara.setAccel(value);
  }
  else if (buffer.startsWith("SIMULTANEOUS")) {
    scara.simultaneousMove(value);
  }
  else if (buffer.startsWith("TAPE0")) {
    scara.tape(value.toInt());
  }
  else {
    Serial.println("Unknown command");
  }
  Serial.println("_DONE");
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