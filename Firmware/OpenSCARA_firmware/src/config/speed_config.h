// SPEED CONTROL
#define Z_AXIS_SPEED 40000
#define Z_AXIS_ACCELERATION 2000
#define Z_AXIS_HOMING_SPEED 40000
#define Z_AXIS_HOMING_ACCELERATION 2000

#define J1_AXIS_SPEED 300
#define J1_AXIS_ACCELERATION 300
#define J1_AXIS_HOMING_SPEED 100
#define J1_AXIS_HOMING_ACCELERATION 50

#define J2_AXIS_SPEED 300
#define J2_AXIS_ACCELERATION 300
#define J2_AXIS_HOMING_SPEED 100
#define J2_AXIS_HOMING_ACCELERATION 50

#define W_AXIS_SPEED 300
#define W_AXIS_ACCELERATION 200
#define W_AXIS_HOMING_SPEED 100
#define W_AXIS_HOMING_ACCELERATION 50

#define TAPE_AXIS_SPEED 1000
#define TAPE_AXIS_ACCELERATION 50


// CALCULATE SPEED FOR MOTOR BEFORE GEARBOX
#define Z_AXIS_INPUT_SPEED (Z_AXIS_SPEED * AXIS_Z_GEAR_RATIO)
#define Z_AXIS_INPUT_ACCELERATION  (Z_AXIS_ACCELERATION * AXIS_Z_GEAR_RATIO)
#define Z_AXIS_INPUT_HOMING_SPEED (Z_AXIS_HOMING_SPEED * AXIS_Z_GEAR_RATIO)
#define Z_AXIS_INPUT_HOMING_ACCELERATION  (Z_AXIS_HOMING_ACCELERATION * AXIS_Z_GEAR_RATIO)

#define J1_AXIS_INPUT_SPEED (J1_AXIS_SPEED * AXIS_J1_GEAR_RATIO)
#define J1_AXIS_INPUT_ACCELERATION  (J1_AXIS_ACCELERATION * AXIS_J1_GEAR_RATIO)
#define J1_AXIS_INPUT_HOMING_SPEED (J1_AXIS_HOMING_SPEED * AXIS_J1_GEAR_RATIO)
#define J1_AXIS_INPUT_HOMING_ACCELERATION  (J1_AXIS_HOMING_ACCELERATION * AXIS_J1_GEAR_RATIO)

#define J2_AXIS_INPUT_SPEED (J2_AXIS_SPEED * AXIS_J2_GEAR_RATIO)
#define J2_AXIS_INPUT_ACCELERATION  (J2_AXIS_ACCELERATION * AXIS_J2_GEAR_RATIO)
#define J2_AXIS_INPUT_HOMING_SPEED (J2_AXIS_HOMING_SPEED * AXIS_J2_GEAR_RATIO)
#define J2_AXIS_INPUT_HOMING_ACCELERATION  (J2_AXIS_HOMING_ACCELERATION * AXIS_J2_GEAR_RATIO)

#define W_AXIS_INPUT_SPEED (W_AXIS_SPEED * AXIS_W_GEAR_RATIO)
#define W_AXIS_INPUT_ACCELERATION  (W_AXIS_ACCELERATION * AXIS_W_GEAR_RATIO)
#define W_AXIS_INPUT_HOMING_SPEED (W_AXIS_HOMING_SPEED * AXIS_W_GEAR_RATIO)
#define W_AXIS_INPUT_HOMING_ACCELERATION  (W_AXIS_HOMING_ACCELERATION * AXIS_W_GEAR_RATIO)

#define TAPE_AXIS_INPUT_SPEED (TAPE_AXIS_SPEED * AXIS_TAPE_GEAR_RATIO)
#define TAPE_AXIS_INPUT_ACCELERATION  (TAPE_AXIS_ACCELERATION * AXIS_TAPE_GEAR_RATIO)
