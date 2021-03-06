#include <Adafruit_NeoPixel.h>
#include <Adafruit_TiCoServo.h>

#ifdef __AVR__
#include <avr/power.h>
#endif

#include "NeoPatterns.h"

// luce del corpo
int bodyLedsPin=12;
void bodyAnimationComplete();
NeoPatterns bodyLeds (30, bodyLedsPin, NEO_GRB + NEO_KHZ800, & bodyAnimationComplete);

// luce del fronte
int frontLedsPin=11;
void frontAnimationComplete();
NeoPatterns frontLeds (5, frontLedsPin, NEO_GRB + NEO_KHZ800, & frontAnimationComplete);

NeoPatterns ledStrips[]={bodyLeds,frontLeds};

// Convert separate R,G,B into packed 32-bit RGB color.
// Packed format is always RGB, regardless of LED strand color order.
uint32_t newColor(uint8_t r, uint8_t g, uint8_t b) {
  return ((uint32_t)r << 16) | ((uint32_t)g <<  8) | b;
}

// Convert separate R,G,B,W into packed 32-bit WRGB color.
// Packed format is always WRGB, regardless of LED strand color order.
uint32_t newColor(uint8_t r, uint8_t g, uint8_t b, uint8_t w) {
  return ((uint32_t)w << 24) | ((uint32_t)r << 16) | ((uint32_t)g <<  8) | b;
}

// Colori belli belli
uint32_t bianco = newColor(255, 255, 255);
uint32_t giallo = newColor(255, 230, 0);
uint32_t arancione = newColor(225, 145, 0);
uint32_t rosso = newColor(255, 0, 0);
uint32_t viola = newColor(210, 50, 210);
uint32_t azzurro = newColor(0, 115, 200);
uint32_t verde = newColor(25, 175, 0);
uint32_t spento = newColor(0, 0, 0);
uint32_t violone = newColor(149, 0, 255);
uint32_t verdeacqua = newColor(0, 232, 209);

uint32_t colorArray[]={ bianco, giallo, arancione,rosso, viola, azzurro, spento, violone, verdeacqua };
uint32_t colorwheel5[] = { arancione,giallo, verde, azzurro, viola};


int record_button_Pin = 2;
int off_button_pin = 17;
int teach_color_mode_Pin = 15;
int teach_sound_mode_Pin = 14;
int play_mode_Pin = 9;

    
void setup() {
  Serial.begin(115200);
  
  bodyLeds.begin();
  frontLeds.begin();
  
  initButtons();
  initMotors();
  initColorSensor();

  InitButtons();
  
  delay (1000);
  ledStrips[1].scanner(newColor(100, 100, 100),  2000);
}

void loop() {
  readSerial();
  readButtons();
  ledStrips[0].update();
  ledStrips[1].update();
  servoUpdate();
  delay(2);
}


//this sequence of commands should be invoked by the raspi when ready... However, adding them here in the setup prevents the robot from faulty initializations. 
void InitButtons(){
  registerNewButton(record_button_Pin);
  registerNewButton(off_button_pin);
  registerNewButton(teach_color_mode_Pin);
  registerNewButton(teach_sound_mode_Pin);
  registerNewButton(play_mode_Pin);
}

//------------------------------------------------------------
//Completion Routines - get called on completion of a led pattern
//------------------------------------------------------------

// bodyColor Completion Callback
void bodyAnimationComplete() {
  if (ledStrips[0].ActivePattern == FADETO) {
    ledStrips[0].Color1 = ledStrips[0].Color2;
    ledStrips[0].ActivePattern = NONE;
  } else if (ledStrips[0].ActivePattern == FADE) {
    ledStrips[0].reverse();
  }
}

// frontLed Completion Callback
void frontAnimationComplete() {
  if (ledStrips[1].ActivePattern == FADETO) {
    ledStrips[1].Color1 = ledStrips[1].Color2;
    ledStrips[1].ActivePattern = NONE;
  } else if (ledStrips[1].ActivePattern == FADE) {
    ledStrips[1].reverse();
  }
}




