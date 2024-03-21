// Ramps 1.4 X - SCARA J1
#define J1_STEP_PIN         54
#define J1_DIR_PIN          55
#define J1_ENABLE_PIN       38

// Ramps 1.4 Y - SCARA J2
#define J2_STEP_PIN         60
#define J2_DIR_PIN          61
#define J2_ENABLE_PIN       56

// Ramps 1.4 Z - SCARA Z
#define Z_STEP_PIN         46
#define Z_DIR_PIN          48
#define Z_ENABLE_PIN       62

// Ramps 1.4 W - SCARA W (gripper rotation)
#define W_STEP_PIN         36
#define W_DIR_PIN          34
#define W_ENABLE_PIN       30

#define TAPE_STEP_PIN         26
#define TAPE_DIR_PIN          28
#define TAPE_ENABLE_PIN       24

#define SDPOWER            -1
#define SDSS               53
#define LED_PIN            13

#define FAN_PIN            9

#define PS_ON_PIN          12
#define KILL_PIN           -1

#define HEATER_0_PIN       10
#define HEATER_1_PIN       8
#define TEMP_0_PIN          13   // ANALOG NUMBERING
#define TEMP_1_PIN          14   // ANALOG NUMBERING


// Endstops
#define Z_MIN_PIN           3
#define J1_MIN_PIN          2
#define J2_MIN_PIN          14
#define W_MIN_PIN           15


// Relays 
#define RELAY_1_PIN         47
#define RELAY_2_PIN         32

// Direction 
#define DIRECTION_CCW   0
#define DIRECTION_CW    1