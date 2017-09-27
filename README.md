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
