#include <Wire.h>
#include "Adafruit_TCS34725.h"

Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_50MS, TCS34725_GAIN_4X);

uint16_t clear, red, green, blue;

int intColorRed, intColorGreen, intColorBlue;
String hexcolor;

void initColorSensor() {
  Serial.println("Color View Test!");
  if (tcs.begin()) {
    Serial.println("Found color sensor");
  } else {
    Serial.println("No TCS34725 found ... check your connections");
    while (1); // halt!
  }
}


void readColor() {
  tcs.setInterrupt(false);      // turn on LED
  delay(60);  // takes 50ms to read
  tcs.getRawData(&red, &green, &blue, &clear);

  tcs.setInterrupt(true);  // turn off LED

  calcHEXColor();
  calcIntColor();

}


void calcHEXColor() {
  uint32_t sum = clear;
  float r, g, b;

  r = red; r /= sum;
  g = green; g /= sum;
  b = blue; b /= sum;
  r *= 256; g *= 256; b *= 256;

  String hex_R = String((int)r, HEX);
  String hex_G = String((int)g, HEX);
  String hex_B = String((int)b, HEX);

  hexcolor = "#" + hex_R + hex_G + hex_B;
}


void calcIntColor() {
  uint32_t sum = clear;
  float r, g, b;

  r = red; r /= sum;
  g = green; g /= sum;
  b = blue; b /= sum;
  r *= 256; g *= 256; b *= 256;

  intColorRed = r;
  intColorGreen = g;  
  intColorBlue = b;
}

int getRedColor() {
  return intColorRed;
}

int getGreenColor() {
  return intColorGreen;
}

int getBlueColor() {
  return intColorBlue;
}

String getHexColor() {
  return hexcolor;
}

void emitColorEvent(int red, int green, int blue) {
  Serial.print("CE/");
  Serial.print(red);
  Serial.print("/");
  Serial.print(green);
  Serial.print("/");
  Serial.print(blue);
  Serial.println("/");
}
