#include <Arduino.h>
#include <AccelStepper/AccelStepper.h>
#include <string.h>

#include <pinmap.h>
#include <configuration.h>

AccelStepper AXIS_Z     (AccelStepper::DRIVER, Z_STEP_PIN, Z_DIR_PIN);
AccelStepper AXIS_J1    (AccelStepper::DRIVER, J1_STEP_PIN, J1_DIR_PIN);
AccelStepper AXIS_J2    (AccelStepper::DRIVER, J2_STEP_PIN, J2_DIR_PIN);
AccelStepper AXIS_W     (AccelStepper::DRIVER, W_STEP_PIN, W_DIR_PIN);
AccelStepper AXIS_TAPE  (AccelStepper::DRIVER, TAPE_STEP_PIN, TAPE_DIR_PIN);

class OpenSCARA {
  public:
    float Z = -1;
    float W = -1;
    float J1 = -1;
    float J2 = -1;

    long tape0 = 0;
    long tape1 = 0;

    float homingAcceleration = DEFAULT_ACCELERATION;
    float movementAcceleration = DEFAULT_ACCELERATION;

    float homingSpeed = DEFAULT_MAX_SPEED * 100;
    float movementSpeed = DEFAULT_MAX_SPEED;

    // Move single axis by steps
    void moveAxis(AccelStepper axis, unsigned long position) {
        axis.setMaxSpeed(movementSpeed);
        axis.setAcceleration(movementAcceleration);
        axis.moveTo(position);
        do {
            axis.run();
        } while (axis.isRunning());
    }

    void homeAxis(AccelStepper axis, uint8_t endstopPin, uint8_t direction, long homingDistance = HOMING_DISTANCE) {
        if(direction == DIRECTION_CCW) {
            homingDistance = homingDistance * -1;
        }
        axis.setCurrentPosition(0);
        axis.setSpeed(homingSpeed);
        while(digitalRead(endstopPin) == HIGH) {
            axis.move(homingDistance);
            do {
                // HOME AXIS WITH CONSTANT SPEED
                axis.runSpeed();
            }
            while(axis.isRunning());
        }
        axis.setCurrentPosition(0);
        axis.setSpeed(movementSpeed);
        axis.setMaxSpeed(movementSpeed);
        axis.setAcceleration(movementAcceleration);
        delay(500);
    }

    long calculateAngularSteps(AccelStepper axis, float currentAngle, float targetAngle, float gearRatio) {
        return round(axis.currentPosition() - (gearRatio * MOTOR_STEPS_PER_REVOLUTION * (targetAngle - currentAngle) / 360.0));
    }

    float moveAngularAxis(AccelStepper axis, float currentAngle, float targetAngle, float gearRatio) {
        long stepsPosition = calculateAngularSteps(axis, currentAngle, targetAngle, gearRatio);
        moveAxis(axis, stepsPosition);
        return targetAngle;
    }
    
    void setZ(int value) {
        if (Z == -1) {
            Serial.println("ERR! Z is not homed yet");
            return; 
        }

        if (Z == value || value < 0) return;

        if (value > (AXIS_Z_MAX_VALUE - AXIS_Z_AXIS_HEIGHT)) {
            Serial.println("ERR! Z is out of range");
            return;
        }

        long steps = static_cast<long>(AXIS_Z.currentPosition() - ((value - Z) /  (AXIS_Z_GEAR_RATIO * MOTOR_STEPS_PER_REVOLUTION)) );
        
        moveAxis(AXIS_Z, steps);

        Z = value;
    }

    void AngleJ1(float targetAngle) {
      if (J1 == -1) {
        Serial.println("ERR! J1 is not homed yet");
        return; 
      }

      if (J1 == targetAngle) return;
      if (targetAngle < 0 || targetAngle > (AXIS_J1_MAX_ANGLE)) {
        Serial.println("ERR! Value is out of range");
        return;
      }

      J1 = moveAngularAxis(AXIS_J1, J1, targetAngle, AXIS_J1_GEAR_RATIO);
    }

    void AngleJ2(float targetAngle) {
      if (J2 == -1) {
        Serial.println("ERR! J2 is not homed yet");
        return; 
      }

      if (J2 == targetAngle) return;
      if (targetAngle < 0 || targetAngle > (AXIS_J2_MAX_ANGLE)) {
        Serial.println("ERR! Value is out of range");
        return;
      }

      J2 = moveAngularAxis(AXIS_J2, J2, targetAngle, AXIS_J2_GEAR_RATIO);
    }

    void AngleW(float targetAngle) {
      if (W == -1) {
        Serial.println("ERR! W is not homed yet");
        return; 
      }

      if (W == targetAngle) return;
      if (targetAngle < 0 || targetAngle > (AXIS_W_MAX_ANGLE)) {
        Serial.println("ERR! Value is out of range");
        return;
      }

      W = moveAngularAxis(AXIS_W, W, targetAngle, AXIS_W_GEAR_RATIO);
    }

    void homeZ() {
        homeAxis(AXIS_Z, Z_MIN_PIN, DIRECTION_CCW, MOTOR_STEPS_PER_REVOLUTION);
        Z = 0;
        setZ(100);
    }

    void homeJ1() {
        homeAxis(AXIS_J1, J1_MIN_PIN, DIRECTION_CW);
        J1 = 0;
    }

    void homeJ2() {
        homeAxis(AXIS_J2, J2_MIN_PIN, DIRECTION_CW);
        J2 = 0;
    }

    void homeW() {
        homeAxis(AXIS_W, W_MIN_PIN, DIRECTION_CW);
        W = 0;
    }

    void homeAll() {
        homeZ();
        homeJ1();
        homeJ2();
        homeW();
    }

    void printStatus() {
        Serial.println("J1: " + String(J1) + " J2: " + String(J2) + " W: " + String(W));
        Serial.println(" TAPE0: " + String(tape0) + " TAPE1: " + String(tape1));
        Serial.println("Z: " + String(Z));
        Serial.println("HOMING SPEED: " + String(homingSpeed) + " HOMING ACCELERATION: " + String(homingAcceleration));
        Serial.println("MOVEMENT SPEED: " + String(movementSpeed) + " MOVEMENT ACCELERATION: " + String(movementAcceleration));
    }

    void simultaneousMove(String value) {
        uint8_t colon = value.indexOf(":");
        String J1_string = value.substring(0, colon);
        String J2_string = value.substring(colon + 1);

        float J1_target_angle = J1_string.toFloat();
        float J2_target_angle = J2_string.toFloat();

        if (J1 == -1) {
            Serial.println("ERR! J1 is not homed yet");
            return; 
        }

        if (J2 == -1) {
            Serial.println("ERR! J2 is not homed yet");
            return; 
        }

        if (J1_target_angle < 0 || J1_target_angle > (AXIS_J1_MAX_ANGLE)) {
            Serial.println("ERR! Value is out of range");
            return;
        }


        if (J2_target_angle < 0 || J2_target_angle > (AXIS_J2_MAX_ANGLE)) {
            Serial.println("ERR! Value is out of range");
            return;
        }
      
        long J1_steps = calculateAngularSteps(AXIS_J1, J1, J1_target_angle, AXIS_J1_GEAR_RATIO);
        long J2_steps = calculateAngularSteps(AXIS_J2, J2, J2_target_angle, AXIS_J2_GEAR_RATIO);

        AXIS_J1.setAcceleration(movementAcceleration);
        AXIS_J1.setMaxSpeed(movementSpeed);

        AXIS_J1.setAcceleration(movementAcceleration);
        AXIS_J2.setMaxSpeed(movementSpeed);

        AXIS_J1.moveTo(J1_steps);
        AXIS_J2.moveTo(J2_steps);
    
        do {
            AXIS_J1.run();
            AXIS_J2.run();
        } while (AXIS_J1.isRunning() || AXIS_J2.isRunning());

        J1 = J1_target_angle;
        J2 = J2_target_angle;
    }

    void gripper(int value) {
      if(value == 0) {
        digitalWrite(RELAY_1_PIN, LOW);
        digitalWrite(RELAY_2_PIN, LOW);
      } else if (value == 1) {
        digitalWrite(RELAY_1_PIN, HIGH);
        digitalWrite(RELAY_2_PIN, HIGH);
      }
      
    }

    void tape(int value) {
        long steps = AXIS_TAPE.currentPosition() + value;
        moveAxis(AXIS_TAPE, steps);
        tape0 = steps;
    }

    void setSpeed(int value) {
        movementSpeed = value;
    }

    void setAccel(int value) {
        movementAcceleration = value;
    }

    OpenSCARA() {}
};

OpenSCARA scara;

void pinConfiguration() {
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

    // Motors config
    AXIS_Z.setMaxSpeed(DEFAULT_MAX_SPEED);
    AXIS_Z.setAcceleration(DEFAULT_ACCELERATION);
    
    AXIS_J1.setMaxSpeed(DEFAULT_MAX_SPEED);
    AXIS_J1.setAcceleration(DEFAULT_ACCELERATION);

    AXIS_J2.setMaxSpeed(DEFAULT_MAX_SPEED);
    AXIS_J2.setAcceleration(DEFAULT_ACCELERATION);

    AXIS_W.setMaxSpeed(DEFAULT_MAX_SPEED);
    AXIS_W.setAcceleration(DEFAULT_ACCELERATION);

    AXIS_TAPE.setMaxSpeed(DEFAULT_MAX_SPEED);
    AXIS_TAPE.setAcceleration(DEFAULT_ACCELERATION);
}

void setup() {
    pinConfiguration();

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
  else if(buffer.startsWith("SETSPEED")) {
    scara.setSpeed(value.toInt());
  }
  else if(buffer.startsWith("SETACCEL")) {
    scara.setAccel(value.toInt());
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