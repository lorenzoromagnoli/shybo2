#include "RunningAverage.h" // per il suono

RunningAverage soundRA(50);

int readSound () {
  soundRA.addValue(loudness);
  soundLevelAVG=soundRA.getAverage();
  return soundLevelAVG;
}






