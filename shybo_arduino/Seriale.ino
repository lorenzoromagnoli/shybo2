String inputString;
boolean stringComplete = false;

boolean debugMode = true;

void debug(String message) {
  if (debugMode) {
    Serial.println(message);
  }
}

String getValue(String data, char separator, int index)
{
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
  debug("command:" + command);

  if (command.equalsIgnoreCase("DW")) {
    debug("digitalWrite");
    int pin = getValue(inputString, '/', 1).toInt();
    int value = getValue(inputString, '/', 2).toInt();
    digitalWrite(pin, value);

  } else if (command.equalsIgnoreCase("RB")) {
    debug("readButton");
    int pin = getValue(inputString, '/', 1).toInt();
    registerNewButton(pin);

  } else if (command.equalsIgnoreCase("MW")) {
    debug("motorWrite");
    int motor = getValue(inputString, '/', 1).toInt();
    int speed = getValue(inputString, '/', 2).toInt();
    int direction = getValue(inputString, '/', 3).toInt();
    moveMotor(motor, speed, direction);

  } else if (command = "LD") {
    debug("ledStrip");
    int animation = getValue(inputString, '/', 1).toInt();
    debug("color");
    Serial.println(animation);

    switch (animation) {
      case 1:
        bodyColor.setFullColor(arancione);
        break;

      case 2:
        bodyColor.setFullColor(rosso);
        break;

      case 3:
        bodyColor.setFullColor(azzurro);
        break;
    }


  } else {
    Serial.println("command unknown");
  }
}




void readSerial() {
  if (Serial.available()) {
    char inChar = Serial.read();
    if (inChar == '\n') {
      parse(inputString);
      //Serial.println(inputString);
      inputString = "";
    } else {
      inputString += inChar;
    }
  }
}
