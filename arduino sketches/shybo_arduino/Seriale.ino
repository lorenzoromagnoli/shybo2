String inputString;
boolean stringComplete = false;

boolean debugMode = true;
boolean echo = true;

void debug(String message) {
  if (debugMode) {
    Serial.print("->");
    Serial.println(message);
  }
}

String getValue(String data, char separator, int index) {
  int found = 0;
  int strIndex[] = {0, -1};
  int maxIndex = data.length() - 1;
  for (int i = 0; i <= maxIndex && found <= index; i++) {
    if (data.charAt(i) == separator || i == maxIndex) {
      found++;
      strIndex[0] = strIndex[1] + 1;
      strIndex[1] = (i == maxIndex) ? i + 1 : i;
    }
  }
  return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
}

void parse (String inputString) {
  String command = getValue(inputString, '/', 0);
  //debug("command:" + command);

  if (command.equalsIgnoreCase("DW")) {
    //debug("digitalWrite");
    int pin = getValue(inputString, '/', 1).toInt();
    int value = getValue(inputString, '/', 2).toInt();
    digitalWrite(pin, value);

  } 
  if (command.equalsIgnoreCase("DR")) {
    //debug("digitalWrite");
    int pin = getValue(inputString, '/', 1).toInt();
    int value= digitalRead(pin);
    emitButtonEvent(pin,value);
  } 
  else if (command.equalsIgnoreCase("RI")) { //set analog pin as input
    //debug("readButton");
    int pin = getValue(inputString, '/', 1).toInt();
    pinMode(pin, INPUT);
  }
  else if (command.equalsIgnoreCase("AR")) { //analogue read
    //debug("readButton");
    int pin = getValue(inputString, '/', 1).toInt();
    int val=analogRead(pin);
    emitAnalogEvent(pin,val);
  }
  else if (command.equalsIgnoreCase("RB")) {
    //debug("readButton");
    int pin = getValue(inputString, '/', 1).toInt();
    registerNewButton(pin);

  } else if (command.equalsIgnoreCase("MW")) {
    //debug("motorWrite");
    int motor = getValue(inputString, '/', 1).toInt();
    int speed = getValue(inputString, '/', 2).toInt();
    int direction = getValue(inputString, '/', 3).toInt();
    moveMotor(motor, speed, direction);

  } else if (command.equalsIgnoreCase("LD")) {

    // LD/1/STATIC/255/255/255 -> set first ledstrip to full red
    // LD/2/STATIC/255/255/255 -> set second ledstrip to full red
    // LD/1/FADE/255/255/255/0/0/0/10/10 -> set first ledstrip to animation, first color is 255 255 255, second color is 0 0 0, 10 steps, 10ms interval between steps.

    String animation = getValue(inputString, '/', 2);
    int ledStripIndex = getValue(inputString, '/', 1).toInt();

    //debug ("set animation: " + animation + " to ledstrip: " + ledStripIndex);

    int parsed_red;
    int parsed_green;
    int parsed_blue;
    int parsed_red2;
    int parsed_green2;
    int parsed_blue2;
    uint32_t color1;
    uint32_t color2;
    int interval;
    int steps;
    int index;

    if (animation.equalsIgnoreCase("STATIC")) {
      parsed_red = getValue(inputString, '/', 3).toInt();
      parsed_green = getValue(inputString, '/', 4).toInt();
      parsed_blue = getValue(inputString, '/', 5).toInt();
      //ledStrips[ledStripIndex].setFullColor(newColor(parsed_red, parsed_green, parsed_blue));
      ledStrips[ledStripIndex].fadeToColor(newColor(parsed_red, parsed_green, parsed_blue), 10, 10, FORWARD);

    } else if (animation.equalsIgnoreCase("COLORWHEEL")) {
      index = getValue(inputString, '/', 3).toInt();
      ledStrips[ledStripIndex].colorWheel(colorwheel5 ,8,index);
    } else {

      parsed_red = getValue(inputString, '/', 3).toInt();
      parsed_green = getValue(inputString, '/', 4).toInt();
      parsed_blue = getValue(inputString, '/', 5).toInt();

      parsed_red2 = getValue(inputString, '/', 6).toInt();
      parsed_green2 = getValue(inputString, '/', 7).toInt();
      parsed_blue2 = getValue(inputString, '/', 8).toInt();

      color1 = newColor(parsed_red, parsed_green, parsed_blue);
      color2 = newColor(parsed_red2, parsed_green2, parsed_blue2);

      interval = getValue(inputString, '/', 9).toInt();
      steps = getValue(inputString, '/', 10).toInt();

      //debug ("interval: " + String(interval) + " steps: " + String(steps));

      if (animation.equalsIgnoreCase("FADE")) {
        ledStrips[ledStripIndex].fade(color1,  color2,  steps,  interval,  FORWARD);
        //debug("starting fade animation");
      } else if (animation.equalsIgnoreCase("BLINK")) {
        ledStrips[ledStripIndex].blinkRed(interval);
        //debug("starting blink animation");
      }else if (animation.equalsIgnoreCase("SCANNER")) {
        ledStrips[ledStripIndex].scanner(color1,interval);
        //debug("starting blink animation");
      }else if (animation.equalsIgnoreCase("COUNT")) {
        ledStrips[ledStripIndex].countTo(color1,color2,interval);
        //debug("starting blink animation");
      }else if (animation.equalsIgnoreCase("FADETO")) {
        ledStrips[ledStripIndex].fadeToColor(color2,steps,interval, FORWARD);
        //debug("starting blink animation");
      }
      
      else {
        //debug("didn't recognize animation");
      }

    }


    //      case 1: //animation setFullColor
    //
    //        break;
    //
    //      case 2:
    //        color1 = getValue(inputString, '/', 2).toInt();
    //        color2 = getValue(inputString, '/', 3).toInt();
    //        steps = getValue(inputString, '/', 4).toInt();
    //        interval = getValue(inputString, '/', 4).toInt();
    //        bodyLeds.fade(colorArray[color1], colorArray[color2], steps, interval);
    //        break;
    //
    //      case 3:
    //        bodyLeds.setFullColor(azzurro);
    //        break;


  } else if (command.equalsIgnoreCase("RC")) {
    //debug("reding colorSensor");
    readColor();
    emitColorEvent(getRedColor(), getGreenColor(), getBlueColor());
    //    debug(getHexColor());
    //    debug(String(getRedColor()));
    //    debug(String(getGreenColor()));
    //    debug(String(getBlueColor()));

  } else if (command.equalsIgnoreCase("SW")) {
    //debug("writing servo");
    int angle = getValue(inputString, '/', 1).toInt();
    moveServo(angle);

  }else if (command.equalsIgnoreCase("SS")) {
    int status = getValue(inputString, '/', 1).toInt();
    debug("shake");
    if (status==0){
      stopShaking();
    }else if (status==1){
      startShaking();
    }

  }else {
    debug("command unknown");
  }
  Serial.println("ok");
}


void readSerial() {
  if (Serial.available()) {
    char inChar = Serial.read();
    if (inChar == '\n') {
      if (echo) {
        Serial.print("->");
        Serial.println(inputString);
      }
      parse(inputString);
      inputString = "";
    } else {
      inputString += inChar;
    }
  }
}

void emitAnalogEvent(int pin, int value) {
  Serial.print("AR/");
  Serial.print(pin);
  Serial.print("/");
  Serial.print(value);
  Serial.println("/");
}

