#!/bin/bash
sleep 8

#create a virtual monitor if on raspi
sudo Xvfb :1 -screen 0 1024x768x24 </dev/null &
export DISPLAY=":1"

#open wekinator
java -jar ./utils/wekinator/WekiMini.jar ./assets/wek/test/WekinatorProject/WekinatorProject.wekproj

#louch robot
forever start ./robot.js -o ./log/output.log -e ./log/error.log
