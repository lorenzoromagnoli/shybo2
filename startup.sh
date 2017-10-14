#!/bin/bash
#sleep 8

# #create a virtual monitor if on raspi
# sudo Xvfb :1 -screen 0 1024x768x24 </dev/null &
# export DISPLAY=":1"
#
# #open wekinator
# java -jar ./utils/wekinator/WekiMini.jar ./assets/wek/test/WekinatorProject/WekinatorProject.wekproj &
#
# #lounch dj impostore script
# python utils/osc_audio_djImpostore.py &
#
# #louch robot forever
# #forever start ./robot.js -o ./log/output.log -e ./log/error.log
#
# #louch robot
# node ./robot.js &


. utils/parallel_commands.sh parallel_commands "sudo Xvfb :1 -screen 0 1024x768x24 </dev/null &
export DISPLAY=":1"" "java -jar ./utils/wekinator/WekiMini.jar ./assets/wek/test/WekinatorProject/WekinatorProject.wekproj" "python utils/osc_audio_djImpostore.py" "node ./robot.js"
