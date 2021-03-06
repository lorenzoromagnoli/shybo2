//Motor A
int PWMA = 5; //Speed control
int AIN1 = 3; //Direction
int AIN2 = 4; //Direction

//Motor B
int PWMB = 6; //Speed control
int BIN1 = 7; //Direction
int BIN2 = 8; //Direction

int motorstandby = 9;

int cappelloChiuso = 40;
int cappelloQuasiChiuso = 33;
int cappelloAperto = 23;

boolean shaking = false;
boolean shakeStatus;

long lastServoMove = 0;
int detachServoAfter = 1000;
boolean servoAttached = false;

//servomotor
Adafruit_TiCoServo servo;
int SERVO_PIN = 10;

#define SERVO_MIN 760 // 1 ms pulse
#define SERVO_MAX 3000 // 2 ms pulse

int servoPosition;

void initMotors() {

  pinMode(PWMA, OUTPUT);
  pinMode(AIN1, OUTPUT);
  pinMode(AIN2, OUTPUT);

  pinMode(PWMB, OUTPUT);
  pinMode(BIN1, OUTPUT);
  pinMode(BIN2, OUTPUT);

  servo.attach(SERVO_PIN, SERVO_MIN, SERVO_MAX);
  servoAttached = true;
  moveServoTo(cappelloAperto, 500);
}

void moveMotor(int motor, int speed, int direction) {
  //Move specific motor at speed and direction
  //motor: 0 for B 1 for A
  //speed: 0 is off, and 255 is full speed
  //direction: 0 clockwise, 1 counter-clockwise
  digitalWrite(motorstandby, HIGH);

  boolean inPin1 = LOW;
  boolean inPin2 = HIGH;

  if (direction == 1) {
    inPin1 = HIGH;
    inPin2 = LOW;
  }

  if (motor == 1) {
    digitalWrite(AIN1, inPin1);
    digitalWrite(AIN2, inPin2);
    analogWrite(PWMA, speed);
  } else {
    digitalWrite(BIN1, inPin1);
    digitalWrite(BIN2, inPin2);
    analogWrite(PWMB, speed);
  }
}

void moveServo(int angle) {
  if (servoAttached == false) {
    servo.attach(SERVO_PIN, SERVO_MIN, SERVO_MAX);
    Serial.println("reattaching Servo");
    servoAttached = true;
  }
  int pulse = map(angle, 0, 180, SERVO_MIN, SERVO_MAX);    // Scale to servo range
  servo.write(pulse);
  lastServoMove = millis();
  servoPosition=angle;
}

void moveServoTo (int angle, int d) {
  if (servoAttached == false) {
    servo.attach(SERVO_PIN, SERVO_MIN, SERVO_MAX);
    Serial.println("reattaching Servo");
    servoAttached = true;
  }
    lastServoMove = millis();

  //servoPosition = servo.read();
  if (servoPosition != angle) {

    if (servoPosition < angle) {
      for (int pos = servoPosition; pos <= angle; pos += 1) {
        moveServo( pos);
        delayMicroseconds(d);
        Serial.println(pos);
      }
    } else {
      for (int pos = servoPosition; pos >= angle; pos -= 1) {
        moveServo( pos);
        delayMicroseconds(d);
        Serial.println(pos);
      }
    }
  }
}

void servoUpdate() {
  if (shaking) {
    shake();
  }
  if (millis() - lastServoMove > detachServoAfter && servoAttached == true) {
    servo.detach();
    servoAttached = false;
    Serial.println("detaching Servo");

  }
}

void shake() {
  if (shakeStatus) {
    moveServoTo (cappelloChiuso, 1);
  } else {
    moveServoTo (cappelloQuasiChiuso, 1);
  }
  shakeStatus = !shakeStatus;
}

void startShaking() {
  shaking = true;
}
void stopShaking() {
  shaking = false;
}

