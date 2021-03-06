import sounddevice as sd
import OSC
import math
import threading
import numpy as np
from scipy.fftpack import fft

fft_size = 256  #+ alto e' questo valore, + aumenta la risoluzione in frequenza e diminuisce la risoluzione nel tempo
hop_size = fft_size/4
window = np.hanning(fft_size)  #per spettro + "bello" provare anche finestra blackman_harris
tol = 1e-14                                                      # threshold used to compute phase

audio_in_channel = 1  #input fisico scheda audio
receive_address = "127.0.0.1", 9000
send_address = "127.0.0.1", 9001

server = OSC.OSCServer(receive_address)
client = OSC.OSCClient()
client.connect(send_address)
print("OSC Server started")


def isPower2(num):
    #taken from Xavier Serra's sms tools
	"""
	Check if num is power of two
	"""
	return ((num & (num - 1)) == 0) and num > 0

def dftAnal(x, w, N):
    #taken from Xavier Serra's sms tools
	"""
	Analysis of a signal using the discrete Fourier transform
	x: input signal, w: analysis window, N: FFT size
	returns mX, pX: magnitude and phase spectrum
	"""

	if not(isPower2(N)):                                 # raise error if N not a power of two
		raise ValueError("FFT size (N) is not a power of 2")

	if (w.size > N):                                        # raise error if window size bigger than fft size
		raise ValueError("Window size (M) is bigger than FFT size")

	hN = (N/2)+1                                            # size of positive spectrum, it includes sample 0
	hM1 = int(math.floor((w.size+1)/2))                     # half analysis window size by rounding
	hM2 = int(math.floor(w.size/2))                         # half analysis window size by floor
	fftbuffer = np.zeros(N)                                 # initialize buffer for FFT
	w = w / sum(w)                                          # normalize analysis window
	xw = x*w                                                # window the input sound
	fftbuffer[:hM1] = xw[hM2:]                              # zero-phase window in fftbuffer
	fftbuffer[-hM2:] = xw[:hM2]
	X = fft(fftbuffer)                                      # compute FFT
	absX = abs(X[:hN])                                      # compute ansolute value of positive side
	absX[absX<np.finfo(float).eps] = np.finfo(float).eps    # if zeros add epsilon to handle log
	mX = 20 * np.log10(absX)                                # magnitude spectrum of positive frequencies in dB
	X[:hN].real[np.abs(X[:hN].real) < tol] = 0.0            # for phase calculation set to 0 the small values
	X[:hN].imag[np.abs(X[:hN].imag) < tol] = 0.0            # for phase calculation set to 0 the small values
	pX = np.unwrap(np.angle(X[:hN]))                        # unwrapped phase spectrum of positive frequencies

	return mX, pX

def stftAnal(x, w, N, H) :
    #taken from Xavier Serra's sms tools
	"""
	Analysis of a sound using the short-time Fourier transform
	x: input array sound, w: analysis window, N: FFT size, H: hop size
	returns xmX, xpX: magnitude and phase spectra
	"""
	if (H <= 0):                                   # raise error if hop size 0 or negative
		raise ValueError("Hop size (H) smaller or equal to 0")

	M = w.size                                      # size of analysis window
	hM1 = int(math.floor((M+1)/2))                  # half analysis window size by rounding
	hM2 = int(math.floor(M/2))                      # half analysis window size by floor
	x = np.append(np.zeros(hM2),x)                  # add zeros at beginning to center first window at sample 0
	x = np.append(x,np.zeros(hM2))                  # add zeros at the end to analyze last sample
	pin = hM1                                       # initialize sound pointer in middle of analysis window
	pend = x.size-hM1                               # last sample to start a frame
	w = w / sum(w)                                  # normalize analysis window
	while pin<=pend:                                # while sound pointer is smaller than last sample
		x1 = x[pin-hM1:pin+hM2]                       # select one frame of input sound
		mX, pX = dftAnal(x1, w, N)                # compute dft
		if pin == hM1:                                # if first frame create output arrays
			xmX = np.array([mX])
			xpX = np.array([pX])
		else:                                         # append output to existing array
			xmX = np.vstack((xmX,np.array([mX])))
			xpX = np.vstack((xpX,np.array([pX])))
		pin += H                                      # advance sound pointer

	return xmX, xpX

def quit_handler(addr, tags, data, client_address):
    print "OSC Server quit."
    server.close()
    client.close()

def run_bastard(addr, tags, data, client_address):
    """
    Ad ogni messaggio OSC all'indirizzo /run_bastard contenente durata del buffer da registrare (in samples)
    es: /run_bastard/44100
    calcola magnutudes e phases STFTs e loudness
    lo spettro delle magnitudes e' in dB, per tornare ad amplitude calcolare 10**(mags/20)
    """

    rec_buffer = sd.rec(data[0], mapping=audio_in_channel)
    sd.wait()

    loudness = np.sqrt(np.mean(rec_buffer**2))
    magnitudes, phases = stftAnal(rec_buffer, window, fft_size, hop_size)

    # magnitudes=10**(magnitudes/20)

    # print(loudness)
    # print(magnitudes[0])
    # print(magnitudes.size)
    # print(magnitudes[0].size)

    # magnitudesAVG=np.average(magnitudes, axis=0)
    # print(magnitudesAVG)

    oscmsg = OSC.OSCMessage()
    oscmsg.setAddress("/fft")
    oscmsg.append(loudness);
    oscmsg.append(magnitudes[0]);
    #oscmsg.append(magnitudesAVG);

    #print(magnitudesAVG.size())
    client.send(oscmsg)

server.addMsgHandler('/run_bastard', run_bastard)
server.addMsgHandler('/quit', quit_handler)

th = threading.Thread(target = server.serve_forever)
th.daemon = False
th.start()
