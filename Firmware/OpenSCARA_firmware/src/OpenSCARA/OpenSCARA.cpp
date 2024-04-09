#include "OpenSCARA.h"

void OpenSCARA::pinConfiguration() {
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
    AXIS_Z.setMaxSpeed(Z_AXIS_INPUT_SPEED);
    AXIS_Z.setAcceleration(Z_AXIS_INPUT_ACCELERATION);
    
    AXIS_J1.setMaxSpeed(J1_AXIS_INPUT_SPEED);
    AXIS_J1.setAcceleration(J1_AXIS_INPUT_ACCELERATION);

    AXIS_J2.setMaxSpeed(J2_AXIS_INPUT_SPEED);
    AXIS_J2.setAcceleration(J2_AXIS_INPUT_ACCELERATION);

    AXIS_W.setMaxSpeed(W_AXIS_INPUT_SPEED);
    AXIS_W.setAcceleration(W_AXIS_INPUT_ACCELERATION);

    AXIS_TAPE.setMaxSpeed(TAPE_AXIS_INPUT_SPEED);
    AXIS_TAPE.setAcceleration(TAPE_AXIS_INPUT_ACCELERATION);
}

long OpenSCARA::calculateAngularSteps(AccelStepper axis, float currentAngle, float targetAngle, float gearRatio) {
    return round(axis.currentPosition() - (gearRatio * MOTOR_STEPS_PER_REVOLUTION * (targetAngle - currentAngle) / 360.0));
}

// Move single axis by steps
void OpenSCARA::moveAxis(AccelStepper axis, unsigned long position, float speed, float acceleration) {
    axis.setMaxSpeed(speed);
    axis.setAcceleration(acceleration);
    axis.moveTo(position);
    do {
        axis.run();
    } while (axis.isRunning());
}

float OpenSCARA::moveAngularAxis(AccelStepper axis, float currentAngle, float targetAngle, float gearRatio, float speed, float acceleration) {
    long stepsPosition = calculateAngularSteps(axis, currentAngle, targetAngle, gearRatio);
    moveAxis(axis, stepsPosition, speed, acceleration);
    return targetAngle;
}

void OpenSCARA::homeAxis(AccelStepper axis, uint8_t endstopPin, uint8_t direction, double homingSpeed, float homingAcceleration, float movementSpeed, float movementAcceleration) {
    // Determine direction of motor rotating

    int homingStep = direction == DIRECTION_CCW ? -5000 : 5000;
    
    // Assume we start from 0
    axis.setCurrentPosition(0);

    // Apply homing settings
    axis.setMaxSpeed(homingSpeed);
    axis.setAcceleration(homingAcceleration);

    // Move until endstop activation
    while(digitalRead(endstopPin) == HIGH) {
        axis.move(homingStep);
        axis.run();
    }

    // Apply movement settings back
    axis.setSpeed(movementSpeed);
    axis.setMaxSpeed(movementSpeed);
    axis.setAcceleration(movementAcceleration);

    delay(500);
}

void OpenSCARA::setZ(int value) {
    if (Z == -1) {
        Serial.println("ERR! Z is not homed yet");
        return; 
    }

    if (Z == value) return;

    if (value < 0 || value > (AXIS_Z_MAX_VALUE - AXIS_Z_AXIS_HEIGHT)) {
        Serial.println("ERR! Z is out of range");
        return;
    }

    long steps = static_cast<long>((value * (MOTOR_STEPS_PER_REVOLUTION / AXIS_Z_GEAR_RATIO)));

    moveAxis(AXIS_Z, steps, Z_movementSpeed, Z_movementAcceleration);

    Z = value;
}

void OpenSCARA::AngleJ1(float targetAngle) {
    if (J1 == -1) {
    Serial.println("ERR! J1 is not homed yet");
    return; 
    }

    if (J1 == targetAngle) return;
    if (targetAngle < 0 || targetAngle > (AXIS_J1_MAX_ANGLE)) {
    Serial.println("ERR! Value is out of range");
    return;
    }

    J1 = moveAngularAxis(AXIS_J1, J1, targetAngle, AXIS_J1_GEAR_RATIO, J1_movementSpeed, J1_movementAcceleration);
}

void OpenSCARA::AngleJ2(float targetAngle) {
    if (J2 == -1) {
    Serial.println("ERR! J2 is not homed yet");
    return; 
    }

    if (J2 == targetAngle) return;
    if (targetAngle < 0 || targetAngle > (AXIS_J2_MAX_ANGLE)) {
    Serial.println("ERR! Value is out of range");
    return;
    }

    J2 = moveAngularAxis(AXIS_J2, J2, targetAngle, AXIS_J2_GEAR_RATIO, J2_movementSpeed, J2_movementAcceleration);
}

void OpenSCARA::AngleW(float targetAngle) {
    if (W == -1) {
    Serial.println("ERR! W is not homed yet");
    return; 
    }

    if (W == targetAngle) return;
    if (targetAngle < 0 || targetAngle > (AXIS_W_MAX_ANGLE)) {
    Serial.println("ERR! Value is out of range");
    return;
    }

    W = moveAngularAxis(AXIS_W, W, targetAngle, AXIS_W_GEAR_RATIO, W_movementSpeed, W_movementAcceleration);
}

void OpenSCARA::homeZ() {
    homeAxis(AXIS_Z, Z_MIN_PIN, DIRECTION_CCW, Z_AXIS_INPUT_HOMING_SPEED, Z_AXIS_INPUT_HOMING_ACCELERATION, Z_movementSpeed, Z_movementAcceleration);

    // HOMED Z IS ON THE TOP OF AXIS
    //Z = (AXIS_Z_MAX_VALUE - AXIS_Z_AXIS_HEIGHT); 

    // Synchronize current position with accel library steps position
    //AXIS_Z.setCurrentPosition((Z * (MOTOR_STEPS_PER_REVOLUTION / AXIS_Z_GEAR_RATIO)));
    
    // SET AXIS ON Z = 100mm
    
    AXIS_Z.setCurrentPosition(0);
    Z = 0;
    setZ(100);
}

void OpenSCARA::homeJ1() {
    homeAxis(AXIS_J1, J1_MIN_PIN, DIRECTION_CW, J1_AXIS_INPUT_HOMING_SPEED, J1_AXIS_INPUT_HOMING_ACCELERATION, J1_movementSpeed, J1_movementAcceleration);
    AXIS_J1.setCurrentPosition(0);
    J1 = 0;
}

void OpenSCARA::homeJ2() {
    homeAxis(AXIS_J2, J2_MIN_PIN, DIRECTION_CW, J2_AXIS_INPUT_HOMING_SPEED, J2_AXIS_INPUT_HOMING_ACCELERATION, J2_movementSpeed, J2_movementAcceleration);
    AXIS_J2.setCurrentPosition(0);
    J2 = 0;
}

void OpenSCARA::homeW() {
    homeAxis(AXIS_W, W_MIN_PIN, DIRECTION_CW, W_AXIS_INPUT_HOMING_SPEED, J2_AXIS_INPUT_HOMING_ACCELERATION, W_movementSpeed, W_movementAcceleration);
    AXIS_W.setCurrentPosition(0);
    W = 0;
}

void OpenSCARA::homeAll() {
    homeZ();
    homeJ1();
    homeJ2();
    homeW();
}

void OpenSCARA::printStatus() {
    Serial.println("J1: " + String(J1) + " J2: " + String(J2) + " W: " + String(W));
    Serial.println(" TAPE0: " + String(tape0) + " TAPE1: " + String(tape1));
    Serial.println("Z: " + String(Z));
    Serial.println("J1 - Movement Speed: " + String(J1_movementSpeed) + " Movement Acceleration: " + String(J1_movementAcceleration));
    Serial.println("J2 - Movement Speed: " + String(J2_movementSpeed) + " Movement Acceleration: " + String(J2_movementAcceleration));
    Serial.println("W - Movement Speed: " + String(W_movementSpeed) + " Movement Acceleration: " + String(W_movementAcceleration));
    Serial.println("Z - Movement Speed: " + String(Z_movementSpeed) + " Movement Acceleration: " + String(Z_movementAcceleration));
}

void OpenSCARA::simultaneousMove(String value) {
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

    AXIS_J1.setAcceleration(J1_movementAcceleration);
    AXIS_J1.setMaxSpeed(J1_movementSpeed);

    AXIS_J2.setAcceleration(J2_movementAcceleration);
    AXIS_J2.setMaxSpeed(J2_movementSpeed);

    AXIS_J1.moveTo(J1_steps);
    AXIS_J2.moveTo(J2_steps);

    do {
        AXIS_J1.run();
        AXIS_J2.run();
    } while (AXIS_J1.isRunning() || AXIS_J2.isRunning());

    J1 = J1_target_angle;
    J2 = J2_target_angle;
}

void OpenSCARA::gripper(int value) {
    if(value == 0) {
    digitalWrite(RELAY_1_PIN, LOW);
    digitalWrite(RELAY_2_PIN, LOW);
    } else if (value == 1) {
    digitalWrite(RELAY_1_PIN, HIGH);
    digitalWrite(RELAY_2_PIN, HIGH);
    }
}

void OpenSCARA::tape(int value) {
    long steps = AXIS_TAPE.currentPosition() + value;
    moveAxis(AXIS_TAPE, steps, TAPE_movementSpeed, TAPE_movementAcceleration);
    tape0 = steps;
}

void OpenSCARA::setSpeed(String value) {
    uint8_t colon = value.indexOf(":");
    String axis = value.substring(0, colon);
    String speed = value.substring(colon + 1);

    int axisSpeed = speed.toFloat();
    if (axis == "Z") {
        Z_movementSpeed = axisSpeed * AXIS_Z_GEAR_RATIO;
    } else if (axis == "J1") {
        J1_movementSpeed = axisSpeed * AXIS_J1_GEAR_RATIO;
    } else if (axis == "J2") {
        J2_movementSpeed = axisSpeed * AXIS_J2_GEAR_RATIO;
    } else if (axis == "W") {
        W_movementSpeed = axisSpeed * AXIS_W_GEAR_RATIO;
    } else if (axis == "TAPE") {
        TAPE_movementSpeed = axisSpeed * AXIS_TAPE_GEAR_RATIO;
    }
}

void OpenSCARA::setAccel(String value) {
    uint8_t colon = value.indexOf(":");
    String axis = value.substring(0, colon);
    String accel = value.substring(colon + 1);
    
    float acceleration = accel.toFloat();
    if (axis == "Z") {
        Z_movementAcceleration = acceleration;
    } else if (axis == "J1") {
        J1_movementAcceleration = acceleration;
    } else if (axis == "J2") {
        J2_movementAcceleration = acceleration;
    } else if (axis == "W") {
        W_movementAcceleration = acceleration;
    } else if (axis == "TAPE") {
        TAPE_movementAcceleration = acceleration;
    }
}

void OpenSCARA::speedMultiplier(int value) {
    Z_movementSpeed = Z_movementSpeed * value;
    J1_movementSpeed = J1_movementSpeed * value;
    J2_movementSpeed = J2_movementSpeed * value;
    W_movementSpeed = W_movementSpeed * value;
    TAPE_movementSpeed = TAPE_movementSpeed * value;
}

OpenSCARA::OpenSCARA(
            AccelStepper& AXIS_Z, 
            AccelStepper& AXIS_J1, 
            AccelStepper& AXIS_J2, 
            AccelStepper& AXIS_W, 
            AccelStepper& AXIS_TAPE
    ) : AXIS_Z(AXIS_Z), AXIS_J1(AXIS_J1), AXIS_J2(AXIS_J2), AXIS_W(AXIS_W), AXIS_TAPE(AXIS_TAPE) {

    Serial.println("OpenSCARA is ready");
}