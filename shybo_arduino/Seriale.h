String inputString;
boolean stringComplete = false;

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
  if (command == "DW") {
    int pin = getValue(inputString, '/', 1).toInt();
    int value = getValue(inputString, '/', 2).toInt();
    digitalWrite(pin, value);
  } else if (command = "RB") {
    int pin = getValue(inputString, '/', 1).toInt();
    registerNewButton(pin);
  }
  else {
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
