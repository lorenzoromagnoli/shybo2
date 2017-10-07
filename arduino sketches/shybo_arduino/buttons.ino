int registerdButtons[10];
int buttonValues[10];
int odlbuttonValues[10];
int buttonArrayLength=10;


void initButtons() {
  for (int i = 0; i < buttonArrayLength; i++) {
    if (registerdButtons[i] == 0) {
      break;
    }
    debug("setting pin "+String(registerdButtons[i])+" as input");
    pinMode(registerdButtons[i], INPUT_PULLUP);
  }
}


void emitButtonEvent(int pin, int value) {
  Serial.print("BE/");
  Serial.print(pin);
  Serial.print("/");
  Serial.print(value);
  Serial.println("/");
}

void readButtons() {
  for (int i = 0; i < buttonArrayLength; i++) {
    if (registerdButtons[i] == 0) {
      break;
    }

    buttonValues[i] = digitalRead(registerdButtons[i]);
    if (buttonValues[i] != odlbuttonValues[i]) {
      emitButtonEvent(registerdButtons[i], buttonValues[i]);
      odlbuttonValues[i] = buttonValues[i];
    }
  }
}

void readButton(int pin) {
  int val=digitalRead(pin);
  emitButtonEvent(pin,val);
}


void registerNewButton(int pin) {
  for (int i = 0; i < buttonArrayLength; i++) {
    if (registerdButtons[i] == 0) {
      registerdButtons[i]=pin;
      initButtons();
      break;
    }
  }
}

