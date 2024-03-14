#include <Arduino.h>
#include <pinmap.h>

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

  OpenSCARA scara;
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

void loop () {
  spinEveryone();
}