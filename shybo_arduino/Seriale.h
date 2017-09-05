String inputString;
boolean stringComplete = false;

void parse (String inputString) {
  Serial.println(inputString);
  switch (inputString.charAt(0)) {
    case ('L') :
      if (inputString.substring(1).toInt() == 0) {
        digitalWrite(13, LOW);
      } else {
        digitalWrite(13, HIGH);
      }
      break;
    case ('#'):
      break;
    case ('C'):
      break;
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
