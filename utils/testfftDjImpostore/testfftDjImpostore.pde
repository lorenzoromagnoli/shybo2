/**
 * oscP5message by andreas schlegel
 * example shows how to create osc messages.
 * oscP5 website at http://www.sojamo.de/oscP5
 */
 
import oscP5.*;
import netP5.*;

OscP5 oscP5;
NetAddress myRemoteLocation;

float[] fft= new float[129];
float loudness=0;

void setup() {
  size(400,400);
  frameRate(25);
  oscP5 = new OscP5(this,9001);
  
  /* myRemoteLocation is a NetAddress. a NetAddress takes 2 parameters,
   * an ip address and a port number. myRemoteLocation is used as parameter in
   * oscP5.send() when sending osc packets to another computer, device, 
   * application. usage see below. for testing purposes the listening port
   * and the port of the remote location address are the same, hence you will
   * send messages back to this sketch.
   */
  myRemoteLocation = new NetAddress("127.0.0.1",9000);
}


void draw() {
  background(255);  
  sendMessage();

  delay(10);
  drawData();
}

void drawData(){
  stroke(0);
 for (int i=1; i<fft.length; i++){
   //println(fft[i]*1000000);
   line(i,fft[i]*-1, i, height);
 }
}


void sendMessage(){
 /* in the following different ways of creating osc messages are shown by example */
  OscMessage myMessage = new OscMessage("/run_bastard");
  myMessage.add(256); /* add an int to the osc message */

  /* send the message */
  oscP5.send(myMessage, myRemoteLocation); 
}

void mousePressed() {
  sendMessage();
}

void keyPressed() {
  /* in the following different ways of creating osc messages are shown by example */
  OscMessage myMessage = new OscMessage("/quit");

  /* send the message */
  oscP5.send(myMessage, myRemoteLocation); 
}

/* incoming osc message are forwarded to the oscEvent method. */
void oscEvent(OscMessage theOscMessage) {
  /* print the address pattern and the typetag of the received OscMessage */
  print("### received an osc message.");
  print(" addrpattern: "+theOscMessage.addrPattern());
  println(" typetag: "+theOscMessage.typetag());
  
    println("got fft");
    loudness=theOscMessage.get(0).floatValue();
    for (int i=0; i<fft.length;i++){
      fft[i]=theOscMessage.get(i+1).floatValue();
    }
  
}