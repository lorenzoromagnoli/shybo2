
// Connections
int servoPin = 9;
int buttonPin = 8;
int bodyColorPin =7;
int eyeColorPin = 5;
int nosePin = A0; //per inserire il manopolino
int trainPin = 6;
int soundSensePin = A1; // per inserire il sensore suono
int coloreSelezionato =0;
int lastcoloreSelezionato=0;

int tempoColore= 1500;
long lastColorChange=0;

int cappelloAperto= 46;
int cappelloQuasiChiuso= 60;
int cappelloChiuso= 76;
boolean shakeStatus=0;


// Sound variables
//int soundSenseValue = 0;
int soundLevelAVG = 0;
int loudness = 0;
int loudnessAvg = 0;

int lowsoundTreshold = 30;
int highsoundTreshold = 650;

int stato = 0;

// Button variables
//int buttonState = 0;
int lastbuttonState = 0;
long previousMillis = 0;        
int buttonState = 0;            // Checks if button is pushed
int buttonPush = 0;             // Toggles between 0 to hold state
long interval = 5000;           // interval at which to write recording (milliseconds)

// Servo variables
int servoPosition = 0;

//input da wekinator
int wekClass = 0;

//per selezionare i colori con il potenziometro
int nosePinValue = 0;

String startrecording = "CR";
String stoprecording = "CS";
String startwekinator = "CP";
String changeclass = "#";


