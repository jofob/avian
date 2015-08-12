    // Flex sensor test program
// Mike Grusin, SFE, 2011
// This program is free, use it however you wish!

// HARDWARE:
// Make the following connections between the Arduino and the flex sensor
// Note that the flex sensor pins are interchangeable

// Sensor pin - GND
// Sensor pin - Analog In 0, with 10K resistor to +5V

// INSTRUCTIONS:
// Upload this sketch to your Arduino, then activate the Serial Monitor
// (set the Serial Monitor to 9600 baud)

void setup()
{
  // initialize serial communications
  Serial.begin(9600); 
}

void loop()
{
  int sensor, degrees;
  int sensor2, degrees2;
  
  
  // read the voltage from the voltage divider (sensor plus resistor)
  sensor = analogRead(0);
  sensor2 = analogRead(1);
  
  // convert the voltage reading to inches
  // the first two numbers are the sensor values for straight (768) and bent (853)
  // the second two numbers are the degree readings we'll map that to (0 to 90 degrees)
  degrees = map(sensor, 654, 912, 0, 90);
  degrees2 = map(sensor2, 654, 912, 0, 90);
  // note that the above numbers are ideal, your sensor's values will vary
  // to improve the accuracy, run the program, note your sensor's analog values
  // when it's straight and bent, and insert those values into the above function.
  
  // print out the result
//  Serial.print("L");  //
//  Serial.println(sensor,DEC);  //
  
  
//  Serial.print("   degrees: ");//
//  Serial.println(degrees,DEC);//
//  Serial.write(degrees);//
  
//  Serial.print("R");  //
//  Serial.println(sensor2,DEC);//
  
  String sensorStr = String(sensor,DEC);
  String sensor2Str = String (sensor2,DEC);


  
  String results = "L";
  results.concat(sensorStr);
  results.concat("xR");
  results.concat(sensor2Str);
  Serial.println(results);
  
//  Serial.print("   degrees2: ");//
 // Serial.println(degrees2,DEC);//
//  Serial.write(degrees2);//
  // pause before taking the next reading
  
  delay(1000);
                       
}
