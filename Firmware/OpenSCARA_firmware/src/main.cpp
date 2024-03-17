#include <Arduino.h>
#include <pinmap.h>
#include <string.h>

class OpenSCARA {
  private:
    // Available screws: t8x8, t8x2
    uint8_t Z_screwPitch = 2;

    // Reduction ratio
    uint8_t J1_gear_ratio = 9; // (1:3 * 1:3) gear
    uint8_t J2_gear_ratio = 8; // (1:2 * 1:4) gear  
    uint8_t W_gear_ratio = 4;  // (1:4) gear

  public:
    int test = 0;

  OpenSCARA() {
    // do some stuff
  }
};

void setup() {
  /*pinMode(FAN_PIN , OUTPUT);
  pinMode(HEATER_0_PIN , OUTPUT);
  pinMode(HEATER_1_PIN , OUTPUT);
  pinMode(LED_PIN  , OUTPUT);
  
  pinMode(X_STEP_PIN  , OUTPUT);
  pinMode(X_DIR_PIN    , OUTPUT);
  pinMode(X_ENABLE_PIN    , OUTPUT);
  
  pinMode(Y_STEP_PIN  , OUTPUT);
  pinMode(Y_DIR_PIN    , OUTPUT);
  pinMode(Y_ENABLE_PIN    , OUTPUT);
  
  pinMode(Z_STEP_PIN  , OUTPUT);
  pinMode(Z_DIR_PIN    , OUTPUT);
  pinMode(Z_ENABLE_PIN    , OUTPUT);
  
  pinMode(E_STEP_PIN  , OUTPUT);
  pinMode(E_DIR_PIN    , OUTPUT);
  pinMode(E_ENABLE_PIN    , OUTPUT);
  
  pinMode(Q_STEP_PIN  , OUTPUT);
  pinMode(Q_DIR_PIN    , OUTPUT);
  pinMode(Q_ENABLE_PIN    , OUTPUT);
  
   digitalWrite(X_ENABLE_PIN    , LOW);
   digitalWrite(Y_ENABLE_PIN    , LOW);
   digitalWrite(Z_ENABLE_PIN    , LOW);
   digitalWrite(E_ENABLE_PIN    , LOW);
   digitalWrite(Q_ENABLE_PIN    , LOW);
   */

  // J1
  pinMode(J1_STEP_PIN, OUTPUT);
  pinMode(J1_DIR_PIN, OUTPUT);
  pinMode(J1_ENABLE_PIN, OUTPUT);

  // Enable Axis
  digitalWrite(J1_ENABLE_PIN, LOW);

  // J2
  pinMode(J2_STEP_PIN, OUTPUT);
  pinMode(J2_DIR_PIN, OUTPUT);
  pinMode(J2_ENABLE_PIN, OUTPUT);

  // Enable Axis
  digitalWrite(J2_ENABLE_PIN, LOW);

  // Z
  pinMode(Z_STEP_PIN, OUTPUT);
  pinMode(Z_DIR_PIN, OUTPUT);
  pinMode(Z_ENABLE_PIN, OUTPUT);

  // Enable Axis
  digitalWrite(Z_ENABLE_PIN, LOW);

  // W
  pinMode(W_STEP_PIN, OUTPUT);
  pinMode(W_DIR_PIN, OUTPUT);
  pinMode(W_ENABLE_PIN, OUTPUT);

  // Enable Axis
  digitalWrite(W_ENABLE_PIN, LOW);

  Serial.begin(9600);

  OpenSCARA scara;

  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB
  }
}

void spinEveryone() {
  digitalWrite(J1_STEP_PIN, HIGH);
  digitalWrite(J2_STEP_PIN, HIGH);
  digitalWrite(Z_STEP_PIN, HIGH);
  digitalWrite(W_STEP_PIN, HIGH);
  delay(1);
  digitalWrite(J1_STEP_PIN, LOW);
  digitalWrite(J2_STEP_PIN, LOW);
  digitalWrite(Z_STEP_PIN, LOW);
  digitalWrite(W_STEP_PIN, LOW);
  delay(1);
}

String buffer = "";

void SetJ1(int value) {
  if(value < 0) {
    digitalWrite(J1_DIR_PIN, HIGH);
    value = -value;
  } else {
    digitalWrite(J1_DIR_PIN, LOW);
  }

  Serial.println("Setting J1 to: " + String(value));

  for (int i = 0; i < value; i++) {
    digitalWrite(J1_STEP_PIN, HIGH);
    delayMicroseconds(400);
    digitalWrite(J1_STEP_PIN, LOW);
    delayMicroseconds(400);
  }
}

void SetJ2(int value) {
  if(value < 0) {
    digitalWrite(J2_DIR_PIN, HIGH);
    value = -value;
  } else {
    digitalWrite(J2_DIR_PIN, LOW);
  }
  
  for (int i = 0; i < value; i++) {
    digitalWrite(J2_STEP_PIN, HIGH);
    delayMicroseconds(400);
    digitalWrite(J2_STEP_PIN, LOW);
    delayMicroseconds(400);
  }
}

void SetJZ(int value) {
  if(value < 0) {
    digitalWrite(Z_DIR_PIN, HIGH);
    value = -value;
  } else {
    digitalWrite(Z_DIR_PIN, LOW);
  }

  for (int i = 0; i < value; i++) {
    digitalWrite(Z_STEP_PIN, HIGH);
    delayMicroseconds(400);
    digitalWrite(Z_STEP_PIN, LOW);
    delayMicroseconds(400);
  }
}

void SetW(int value) {
  if(value < 0) {
    digitalWrite(W_DIR_PIN, HIGH);
    value = -value;
  } else {
    digitalWrite(W_DIR_PIN, LOW);
  }

  for (int i = 0; i < value; i++) {
    digitalWrite(W_STEP_PIN, HIGH);
    delayMicroseconds(400);
    digitalWrite(W_STEP_PIN, LOW);
    delayMicroseconds(400);
  }
}

void parse(String buffer) {
  uint8_t space = buffer.indexOf(" ");
  
  // String builder
  String command = buffer.substring(0, space);
  String value = buffer.substring(space + 1);

  if (buffer.startsWith("J1")) {
    SetJ1(value.toInt());
  }
  else if (buffer.startsWith("J2")) {
    SetJ2(value.toInt());
  }
  else if (buffer.startsWith("Z")) {
    SetJZ(value.toInt());
  }
  else if (buffer.startsWith("W")) {
    SetW(value.toInt());
  }
  else {
    Serial.println("Unknown command");
  }
}

void loop () {
  if(Serial.available()) {
    char byte = Serial.read();
    buffer += byte;
    if (byte == '\n' || byte == '\r') {
      Serial.println("Parsing: " + buffer);
      parse(buffer);
      buffer = "";
    }
  }
}