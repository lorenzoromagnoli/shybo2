#!/bin/bash
#sleep 8

#create a virtual monitor if on raspi
sudo Xvfb :1 -screen 0 1024x768x24 </dev/null &
export DISPLAY=":1"

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
#
#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"

. ./utils/parallel_commands.sh parallel_commands "java -jar ./utils/wekinator/WekiMini.jar ./assets/wek/shybo/shybo.wekproj" "python utils/osc_audio_djImpostore.py" "node ./robot.js"
