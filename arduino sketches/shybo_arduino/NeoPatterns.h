#include <Adafruit_NeoPixel.h>

// Pattern types supported:
enum  pattern { NONE, RAINBOW_CYCLE, THEATER_CHASE, COLOR_WIPE, SCANNER, FADE, BLINK_RED, COLOR_WHEEL, FADETO };
// Patern directions supported:
enum  direction { FORWARD, REVERSE };

const uint8_t PROGMEM gamma8[] = {
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,
  1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  2,  2,  2,  2,
  2,  3,  3,  3,  3,  3,  3,  3,  4,  4,  4,  4,  4,  5,  5,  5,
  5,  6,  6,  6,  6,  7,  7,  7,  7,  8,  8,  8,  9,  9,  9, 10,
  10, 10, 11, 11, 11, 12, 12, 13, 13, 13, 14, 14, 15, 15, 16, 16,
  17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 24, 24, 25,
  25, 26, 27, 27, 28, 29, 29, 30, 31, 32, 32, 33, 34, 35, 35, 36,
  37, 38, 39, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 50,
  51, 52, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 66, 67, 68,
  69, 70, 72, 73, 74, 75, 77, 78, 79, 81, 82, 83, 85, 86, 87, 89,
  90, 92, 93, 95, 96, 98, 99, 101, 102, 104, 105, 107, 109, 110, 112, 114,
  115, 117, 119, 120, 122, 124, 126, 127, 129, 131, 133, 135, 137, 138, 140, 142,
  144, 146, 148, 150, 152, 154, 156, 158, 160, 162, 164, 167, 169, 171, 173, 175,
  177, 180, 182, 184, 186, 189, 191, 193, 196, 198, 200, 203, 205, 208, 210, 213,
  215, 218, 220, 223, 225, 228, 231, 233, 236, 239, 241, 244, 247, 249, 252, 255
};

class NeoPatterns : public Adafruit_NeoPixel {
  public:

    // Member Variables:
    pattern  ActivePattern;  // which pattern is running
    direction Direction;     // direction to run the pattern

    unsigned long Interval;   // milliseconds between updates
    unsigned long lastUpdate; // last update of position
    boolean blinkStatus; // last update of position

    uint32_t Color1, Color2;  // What colors are in use
    uint16_t TotalSteps;  // total number of steps in the pattern
    uint16_t Index;  // current step within the pattern


    void (*OnComplete)();  // Callback on completion of pattern

    // Constructor - calls base-class constructor to initialize strip
    NeoPatterns(uint16_t pixels, uint8_t pin, uint8_t type, void (*callback)())
      : Adafruit_NeoPixel(pixels, pin, type)
    {
      OnComplete = callback;
      //setBrightness(30);
    }


    void setPixelColorGamma(uint16_t n, uint8_t r, uint8_t g, uint8_t b) {
      setPixelColor(n, pgm_read_byte(&gamma8[r]), pgm_read_byte(&gamma8[g]), pgm_read_byte(&gamma8[b]));
    }
    void setPixelColorGamma(uint16_t n, uint8_t r, uint8_t g, uint8_t b, uint8_t w) {
      setPixelColor(n, pgm_read_byte(&gamma8[r]), pgm_read_byte(&gamma8[g]), pgm_read_byte(&gamma8[b]), w);
    }
    void setPixelColorGamma(uint16_t n, uint32_t c) {
      uint8_t *p, r = (uint8_t)(c >> 16), g = (uint8_t)(c >>  8), b = (uint8_t)c;
      setPixelColor(n, pgm_read_byte(&gamma8[r]), pgm_read_byte(&gamma8[g]), pgm_read_byte(&gamma8[b]));
    }

    // Update the pattern
    void update()
    {
      if ((millis() - lastUpdate) > Interval) // time to update
      {
        lastUpdate = millis();
        switch (ActivePattern)
        {
          case RAINBOW_CYCLE:
            rainbowCycleUpdate();
            break;
          case THEATER_CHASE:
            theaterChaseUpdate();
            break;
          case COLOR_WIPE:
            colorWipeUpdate();
            break;
          case SCANNER:
            scannerUpdate();
            break;
          case FADE:
            fadeUpdate();
            break;
          case FADETO:
            fadeUpdate();
            break;
          case BLINK_RED:
            blinkRedUpdate();
            break;
          default:
            break;
        }
      }
    }

    // Increment the Index and reset at the end
    void increment()
    {
      if (Direction == FORWARD)
      {
        Index++;
        if (Index >= TotalSteps)
        {
          Index = 0;
          if (OnComplete != NULL)
          {
            OnComplete(); // call the comlpetion callback
          }
        }
      }
      else // Direction == REVERSE
      {
        --Index;
        if (Index <= 0)
        {
          Index = TotalSteps - 1;
          if (OnComplete != NULL)
          {
            OnComplete(); // call the comlpetion callback
          }
        }
      }
    }

    // Reverse pattern direction
    void reverse()
    {
      if (Direction == FORWARD)
      {
        Direction = REVERSE;
        Index = TotalSteps - 1;
      }
      else
      {
        Direction = FORWARD;
        Index = 0;
      }
    }


    // Initialize for a RainbowCycle
    void rainbowCycle(uint8_t interval, direction dir = FORWARD)
    {
      ActivePattern = RAINBOW_CYCLE;
      Interval = interval;
      TotalSteps = 255;
      Index = 0;
      Direction = dir;
    }

    // Update the Rainbow Cycle Pattern
    void rainbowCycleUpdate()
    {
      for (int i = 0; i < numPixels(); i++)
      {
        setPixelColorGamma(i, Wheel(((i * 256 / numPixels()) + Index) & 255));
      }
      show();
      increment();
    }

    // Initialize for a Theater Chase
    void theaterChase(uint32_t color1, uint32_t color2, uint8_t interval, direction dir = FORWARD)
    {
      ActivePattern = THEATER_CHASE;
      Interval = interval;
      TotalSteps = numPixels();
      Color1 = color1;
      Color2 = color2;
      Index = 0;
      Direction = dir;
    }


    // Update the Theater Chase Pattern
    void theaterChaseUpdate()
    {
      for (int i = 0; i < numPixels(); i++)
      {
        if ((i + Index) % 3 == 0)
        {
          setPixelColorGamma(i, Color1);
        }
        else
        {
          setPixelColorGamma(i, Color2);
        }
      }
      show();
      increment();
    }

    // Initialize for a Blink Red
    void blinkRed(uint8_t interval)  {
      setFullColor(Color(0, 0, 0));
      ActivePattern = BLINK_RED;
      Interval = interval;
      Index = 0;

    }

    // Update the Blink Red Pattern
    void blinkRedUpdate()  {
      blinkStatus = !blinkStatus;

      if (blinkStatus) {
        setPixelColorGamma(Index, Color(255, 0, 0));
      } else {
        setPixelColorGamma(Index, Color(0, 0, 0));
        Index++;

        if (Index == numPixels()) {
          Index = 0;
        }
      }
      show();
    }

    // Initialize for a eye colors in color selection
    void colorWheel(uint32_t colors[],  int length, int index)  {
      ActivePattern = NONE;
      for (int i = 0; i < length; i++) {

        if (i + index % numPixels() >= numPixels()) {
          setPixelColorGamma(i, colors[i + index % numPixels() - numPixels()]);
        } else {
          setPixelColorGamma(i, colors[i + index % numPixels()]);
        }
      }
      show();
    }

    // Count
    void countTo(uint32_t color1, uint32_t color2,  int n)  {
      ActivePattern = NONE;
      for (int i = 0; i < numPixels(); i++) {
        if (i < n) {
          setPixelColorGamma(i, color1);
        } else {
          setPixelColorGamma(i, color2);
        }
      }
      show();
    }



    // Initialize for a ColorWipe
    void colorWipe(uint32_t color, uint8_t interval, direction dir = FORWARD)
    {
      ActivePattern = COLOR_WIPE;
      Interval = interval;
      TotalSteps = numPixels();
      Color1 = color;
      Index = 0;
      Direction = dir;
    }

    // Update the Color Wipe Pattern
    void colorWipeUpdate()
    {
      setPixelColorGamma(Index, Color1);
      show();
      increment();
    }

    // Initialize for a SCANNNER
    void scanner(uint32_t color1, uint8_t interval)
    {
      ActivePattern = SCANNER;
      Interval = interval;
      TotalSteps = (numPixels() - 1) * 2;
      Color1 = color1;
      Index = 0;
    }

    // Update the Scanner Pattern
    void scannerUpdate()
    {
      for (int i = 0; i < numPixels(); i++)
      {
        if (i == Index)  // Scan Pixel to the right
        {
          setPixelColorGamma(i, Color1);
        }
        else if (i == TotalSteps - Index) // Scan Pixel to the left
        {
          setPixelColorGamma(i, Color1);
        }
        else // Fading tail
        {
          setPixelColorGamma(i, dimColor(getPixelColor(i)));
        }
      }
      show();
      increment();
    }

    // Initialize for a Fade
    void fade(uint32_t color1, uint32_t color2, uint16_t steps, uint8_t interval, direction dir = FORWARD)
    {
      ActivePattern = FADE;
      Interval = interval;
      TotalSteps = steps;
      Color1 = color1;
      Color2 = color2;
      Index = 0;
      Direction = dir;
    }

    // Set all pixels to a color (synchronously)
    // Initialize for a Fade
    void fadeToColor(uint32_t color, uint16_t steps, uint8_t interval, direction dir = FORWARD)
    {
      ActivePattern = FADETO;
      Interval = interval;
      TotalSteps = steps;
      Color2 = color;
      Index = 0;
      Direction = dir;
    }


    // Update the Fade Pattern
    void fadeUpdate()
    {
      // Calculate linear interpolation between Color1 and Color2
      // Optimise order of operations to minimize truncation error
      uint8_t red = ((Red(Color1) * (TotalSteps - Index)) + (Red(Color2) * Index)) / TotalSteps;
      uint8_t green = ((Green(Color1) * (TotalSteps - Index)) + (Green(Color2) * Index)) / TotalSteps;
      uint8_t blue = ((Blue(Color1) * (TotalSteps - Index)) + (Blue(Color2) * Index)) / TotalSteps;

      colorSet(Color(red, green, blue));
      show();
      increment();
    }

    // Calculate 50% dimmed version of a color (used by ScannerUpdate)
    uint32_t dimColor(uint32_t color)
    {
      // Shift R, G and B components one bit to the right
      uint32_t dimColor = Color(Red(color) >> 1, Green(color) >> 1, Blue(color) >> 1);
      return dimColor;
    }

    // Set all pixels to a color (synchronously)
    void colorSet(uint32_t color)
    {
      for (int i = 0; i < numPixels(); i++)
      {
        setPixelColorGamma(i, color);
      }
      show();
    }

    // Set all pixels to a color (synchronously)
    void setFullColor(uint32_t color)
    {
      ActivePattern = NONE;
      for (int i = 0; i < numPixels(); i++)
      {
        setPixelColorGamma(i, color);
      }
      show();
    }


    // Returns the Red component of a 32-bit color
    uint8_t Red(uint32_t color)
    {
      return (color >> 16) & 0xFF;
    }

    // Returns the Green component of a 32-bit color
    uint8_t Green(uint32_t color)
    {
      return (color >> 8) & 0xFF;
    }

    // Returns the Blue component of a 32-bit color
    uint8_t Blue(uint32_t color)
    {
      return color & 0xFF;
    }

    // Input a value 0 to 255 to get a color value.
    // The colours are a transition r - g - b - back to r.
    uint32_t Wheel(byte WheelPos)
    {
      WheelPos = 255 - WheelPos;
      if (WheelPos < 85)
      {
        return Color(255 - WheelPos * 3, 0, WheelPos * 3);
      }
      else if (WheelPos < 170)
      {
        WheelPos -= 85;
        return Color(0, WheelPos * 3, 255 - WheelPos * 3);
      }
      else
      {
        WheelPos -= 170;
        return Color(WheelPos * 3, 255 - WheelPos * 3, 0);
      }
    }
};

