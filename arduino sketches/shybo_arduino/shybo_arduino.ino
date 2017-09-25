#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
#include <avr/power.h>
#endif
#include "NeoPatterns.h"
#include <Adafruit_TiCoServo.h>
#include "RunningAverage.h" // per il suono
#include "buttons.h"
#include "motors.h"



// luce del corpo
int bodyColorPin=6;
void bodyColorComplete();
NeoPatterns bodyColor (30, bodyColorPin, NEO_GRB + NEO_KHZ800, & bodyColorComplete);


// Colori belli belli
uint32_t bianco = bodyColor.Color(255, 255, 255);
uint32_t giallo = bodyColor.Color(255, 230, 0);
uint32_t arancione = bodyColor.Color(225, 90, 0);
uint32_t rosso = bodyColor.Color(255, 0, 0);
uint32_t viola = bodyColor.Color(125, 0, 125);
uint32_t azzurro = bodyColor.Color(0, 115, 200);
uint32_t verde = bodyColor.Color(25, 175, 0);
uint32_t spento = bodyColor.Color(0, 0, 0);
uint32_t violone = bodyColor.Color(149, 0, 255);
uint32_t verdeacqua = bodyColor.Color(0, 232, 209);

uint32_t colorArray[]={bianco, giallo, arancione,rosso, viola, azzurro, spento, violone, verdeacqua};

void setup() {
  Serial.begin(9600);
  
  bodyColor.begin();
  
  initButtons();
  initMotors();
  initColorSensor();
  
  delay (2000);
}

void loop() {
  readSerial();
  readButtons();
  
  bodyColor.update();
}




//------------------------------------------------------------
//Completion Routines - get called on completion of a pattern
//------------------------------------------------------------

// bodyColor Completion Callback
void bodyColorComplete() {

  if (bodyColor.ActivePattern == FADETO) {
    bodyColor.Color1 = bodyColor.Color2;
    bodyColor.ActivePattern = NONE;
  } else if (bodyColor.ActivePattern == FADE) {
    bodyColor.reverse();
  }
}


