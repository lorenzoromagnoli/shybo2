#shybo 2

The second version of shybo.

### hardware
  based on raspi zero w + arduino communicating over serialport

### installation

#####upgrade node js and npm

'
$ wget -O - https://raw.githubusercontent.com/sdesalas/node-pi-zero/master/install-node-v7.7.1.sh | bash
'

##### install dependencies

npm install

configuring ao


#set usb soud card as default
pcm.!default  {
 type hw card 1
}
ctl.!default {
 type hw card 1
}

install forever globally

sudo -i npm install forever -g


useful command to talk to the serial port from terminal
'''
picocom --omap crlf,delbs --emap crcrlf /dev/tty.Repleo-PL2303-00001014 9600 --echo
picocom --omap crlf,delbs --emap crcrlf /dev/serial0 9600 --echo
'''

copy the file shybo.init.sh to the /etc/init.d folder
