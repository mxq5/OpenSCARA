#include <AccelStepper/AccelStepper.h>

#include <config/physical_config.h>
#include <config/speed_config.h>
#include <config/pinmap.h>

#define DIRECTION_CW 1
#define DIRECTION_CCW 0

class OpenSCARA {
    public:
        OpenSCARA(
            AccelStepper& AXIS_Z, 
            AccelStepper& AXIS_J1, 
            AccelStepper& AXIS_J2, 
            AccelStepper& AXIS_W, 
            AccelStepper& AXIS_TAPE
        );

        void pinConfiguration();
        void homeAll();
        void homeZ();
        void homeJ1();
        void homeJ2();
        void homeW();

        void setZ(int value);
        void AngleJ1(float targetAngle);
        void AngleJ2(float targetAngle);
        void AngleW(float targetAngle);
        void gripper(int value);
        void printStatus();
        void speedMultiplier(int value);
        void setSpeed(String value);
        void setAccel(String value);
        void simultaneousMove(String value);   
        void tape(int value);

    private:
        // Motors    
        AccelStepper& AXIS_Z;
        AccelStepper& AXIS_J1;
        AccelStepper& AXIS_J2;
        AccelStepper& AXIS_W;
        AccelStepper& AXIS_TAPE;

        // Axis values
        float Z = -1;
        float W = -1;
        float J1 = -1;
        float J2 = -1;

        long tape0 = 0;
        long tape1 = 0;

        // Acceleration and speed values for all axis
        float Z_movementSpeed = Z_AXIS_INPUT_SPEED;
        float Z_movementAcceleration = Z_AXIS_INPUT_ACCELERATION;

        float J1_movementSpeed = J1_AXIS_INPUT_SPEED;
        float J1_movementAcceleration = J1_AXIS_INPUT_ACCELERATION;

        float J2_movementSpeed = J2_AXIS_INPUT_SPEED;
        float J2_movementAcceleration = J2_AXIS_INPUT_ACCELERATION;

        float W_movementSpeed = W_AXIS_INPUT_SPEED;
        float W_movementAcceleration = W_AXIS_INPUT_ACCELERATION;

        float TAPE_movementSpeed = TAPE_AXIS_INPUT_SPEED;
        float TAPE_movementAcceleration = TAPE_AXIS_INPUT_ACCELERATION;
        
        long calculateAngularSteps(AccelStepper axis, float currentAngle, float targetAngle, float gearRatio);
        void moveAxis(AccelStepper axis, unsigned long position, float speed, float acceleration);
        float moveAngularAxis(AccelStepper axis, float currentAngle, float targetAngle, float gearRatio, float speed, float acceleration);
        void homeAxis(AccelStepper axis, uint8_t endstopPin, uint8_t direction, float homingSpeed, float movementSpeed, float movementAcceleration);
};